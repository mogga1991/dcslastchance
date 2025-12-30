import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getEmbeddingService } from "@/lib/embeddings/pinecone-service";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildSystemPrompt(opportunityData: any, hasDocumentContent: boolean = false): string {
  const hasAttachments = opportunityData.resourceLinks && opportunityData.resourceLinks.length > 0;
  const attachmentsList = hasAttachments
    ? opportunityData.resourceLinks.map((link: string, idx: number) => `   ${idx + 1}. ${link}`).join('\n')
    : '   No attachments available in the listing';

  const description = opportunityData.description || "Not specified";
  const descriptionPreview = description.length > 500
    ? description.substring(0, 500) + "... [truncated]"
    : description;

  const contextNote = hasDocumentContent
    ? `✅ DOCUMENT ANALYSIS ACTIVE:
I have processed and analyzed the PDF attachments. When you ask questions, I will search through the actual document content and provide relevant excerpts with page numbers. You now have access to the detailed requirements, specifications, and criteria from the RFP/solicitation documents.`
    : `⚠️ BASIC LISTING DATA ONLY:
This analysis is based on the BASIC LISTING DATA. The complete RFP/solicitation with detailed requirements, specifications, technical criteria, compliance rules, evaluation factors, and legal terms is contained in the ATTACHED DOCUMENTS below. I can provide the attachment links but cannot yet analyze the PDF content.`;

  return `You are an expert GSA leasing analyst helping commercial real estate brokers analyze federal lease opportunities from SAM.gov.

${contextNote}

OPPORTUNITY SUMMARY:
Title: ${opportunityData.title || "Not specified"}
Solicitation Number: ${opportunityData.solicitationNumber || "Not specified"}
Location: ${opportunityData.placeOfPerformance?.city?.name || "Not specified"}, ${opportunityData.placeOfPerformance?.state?.code || "Not specified"}
Response Deadline: ${opportunityData.responseDeadLine || "Not specified"}
Posted Date: ${opportunityData.postedDate || "Not specified"}
NAICS Code: ${opportunityData.naicsCode || "Not specified"}
Set-Aside: ${opportunityData.typeOfSetAsideDescription || opportunityData.typeOfSetAside || "Not specified"}
Type: ${opportunityData.type || "Not specified"}

DESCRIPTION (from listing):
${descriptionPreview}

📎 ATTACHED DOCUMENTS (Full RFP/Solicitation):
${attachmentsList}

🔗 SAM.gov LINKS:
- Full Opportunity Page: ${opportunityData.uiLink || "Not available"}
- Additional Info: ${opportunityData.additionalInfoLink || "Not available"}

YOUR ROLE:
${hasDocumentContent
    ? `1. Answer questions using the RELEVANT DOCUMENT EXCERPTS provided in each user message
2. Reference specific page numbers and excerpt numbers when citing information
3. If the excerpts don't contain the answer, acknowledge this and suggest the user review the full attachments
4. Explain government contracting terms in plain, broker-friendly language
5. For detailed requirements (square footage, building class, deadlines), cite the specific excerpt and page number
6. If you need information not in the provided excerpts, recommend which attachment document might contain it

IMPORTANT: The excerpts provided are automatically selected based on relevance to each question. They are direct quotes from the actual PDF documents with page numbers for verification.`
    : `1. Provide high-level analysis of the basic listing information above
2. **ALWAYS remind users** that detailed requirements (square footage specs, building class, parking, technical standards, evaluation criteria, compliance rules) are in the attached documents
3. When users ask about specific requirements, provide the attachment links where they can find the details
4. Explain government contracting terms in plain, broker-friendly language
5. Be transparent about what you can see in the basic listing vs. what requires reviewing the full attachments
6. For initial summaries, note: "Based on the listing summary..." and point to attachments for complete details

REMEMBER: The attachments contain the authoritative, complete information. Your analysis of the basic listing is just a starting point to help brokers quickly assess if this opportunity is worth deeper investigation.`}`;

}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const startTime = Date.now();

  console.log('[CHAT API] POST request received');
  console.log('[CHAT API] ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);

  try {
    // Parse request body
    const body = await request.json();
    const { opportunityId, message, opportunityData } = body;

    console.log('[CHAT API] Request body:', {
      opportunityId,
      messageLength: message?.length,
      hasOpportunityData: !!opportunityData
    });

    if (!opportunityId || !message || !opportunityData) {
      return NextResponse.json(
        { error: "Missing required fields: opportunityId, message, opportunityData" },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[CHAT API] Authentication failed:', userError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('[CHAT API] User authenticated:', user.id);

    // Create or retrieve chat session
    const { data: existingChat, error: chatFetchError } = await supabase
      .from("opportunity_chats")
      .select("id")
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunityId)
      .single();

    let chatId: string;

    if (existingChat) {
      chatId = existingChat.id;

      // Update timestamp
      await supabase
        .from("opportunity_chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);
    } else {
      // Create new chat session
      const { data: newChat, error: chatInsertError } = await supabase
        .from("opportunity_chats")
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          opportunity_title: opportunityData.title,
        })
        .select("id")
        .single();

      if (chatInsertError || !newChat) {
        console.error("Error creating chat session:", chatInsertError);
        return NextResponse.json(
          { error: "Failed to create chat session" },
          { status: 500 }
        );
      }

      chatId = newChat.id;
    }

    // Load conversation history (last 20 messages for context)
    const { data: messageHistory, error: historyError } = await supabase
      .from("opportunity_chat_messages")
      .select("role, content")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (historyError) {
      console.error("Error loading message history:", historyError);
    }

    // Save user message to database
    const { error: userMessageError } = await supabase
      .from("opportunity_chat_messages")
      .insert({
        chat_id: chatId,
        role: "user",
        content: message,
        metadata: {},
      });

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
    }

    // Build conversation history for Anthropic
    const conversationHistory: Anthropic.MessageParam[] = (messageHistory || []).map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Search for relevant document chunks using Pinecone RAG
    let relevantChunks = [];
    let documentContext = "";

    if (process.env.ENABLE_PDF_ANALYSIS === 'true') {
      try {
        console.log('[CHAT API] Searching Pinecone for relevant document chunks...');
        const embeddingService = getEmbeddingService();

        relevantChunks = await embeddingService.searchSimilarChunks(
          message,
          opportunityId,
          {
            topK: 5,
            similarityThreshold: 0.7,
          }
        );

        if (relevantChunks.length > 0) {
          console.log(`[CHAT API] Found ${relevantChunks.length} relevant document chunks`);

          documentContext = `\n\n📄 RELEVANT DOCUMENT EXCERPTS:\n${relevantChunks
            .map((chunk, i) =>
              `[Excerpt ${i + 1}, Page ${chunk.pageNumber || '?'}, Similarity: ${(chunk.similarity! * 100).toFixed(1)}%]:\n${chunk.chunkText}`
            )
            .join('\n\n---\n\n')}\n`;
        } else {
          console.log('[CHAT API] No relevant document chunks found above threshold');
        }
      } catch (error) {
        console.error('[CHAT API] Error searching Pinecone:', error);
        // Continue without RAG context if search fails
      }
    }

    // Add current user message with document context
    conversationHistory.push({
      role: "user",
      content: message + documentContext,
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('[CHAT API] Starting Anthropic stream...');
          console.log('[CHAT API] Conversation history length:', conversationHistory.length);

          // Call Anthropic API with streaming
          // Try Claude 3 Opus which should definitely be available
          const messageStream = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 2048,
            system: buildSystemPrompt(opportunityData, relevantChunks.length > 0),
            messages: conversationHistory,
            stream: true,
          });

          console.log('[CHAT API] Anthropic stream created successfully');

          let fullAssistantMessage = "";
          let inputTokens = 0;
          let outputTokens = 0;
          let eventCount = 0;

          // Stream events to client
          for await (const event of messageStream) {
            eventCount++;
            if (eventCount === 1) {
              console.log('[CHAT API] First event received:', event.type);
            }

            if (event.type === "message_start") {
              // Send message start event
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "message_start",
                  })}\n\n`
                )
              );
            } else if (event.type === "content_block_delta") {
              // Stream content chunks
              const delta = event.delta;
              if (delta.type === "text_delta") {
                fullAssistantMessage += delta.text;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "content_delta",
                      content: delta.text,
                    })}\n\n`
                  )
                );
              }
            } else if (event.type === "message_delta") {
              // Capture token usage
              if (event.usage) {
                outputTokens = event.usage.output_tokens;
              }
            }
          }

          // Save assistant message to database
          const generationTimeMs = Date.now() - startTime;

          console.log('[CHAT API] Stream complete. Events:', eventCount);
          console.log('[CHAT API] Full message length:', fullAssistantMessage.length);
          console.log('[CHAT API] Tokens - Input:', inputTokens, 'Output:', outputTokens);

          await supabase.from("opportunity_chat_messages").insert({
            chat_id: chatId,
            role: "assistant",
            content: fullAssistantMessage,
            metadata: {
              model: "claude-3-5-sonnet-20241022",
              tokensUsed: inputTokens + outputTokens,
              generationTimeMs,
            },
          });

          // Send completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "message_complete",
                metadata: {
                  tokensUsed: inputTokens + outputTokens,
                  generationTimeMs,
                },
              })}\n\n`
            )
          );

          console.log('[CHAT API] Stream closed successfully');
          controller.close();
        } catch (error) {
          console.error("[CHAT API] Error in streaming response:", error);
          console.error("[CHAT API] Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            status: (error as any)?.status,
            type: (error as any)?.type
          });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process chat message" },
      { status: 500 }
    );
  }
}

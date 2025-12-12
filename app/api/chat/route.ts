import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { protectApiRoute, sanitizeInput } from "@/lib/api-security";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Security: Require authentication and rate limit
  const protection = await protectApiRoute({
    requireAuth: true,
    rateLimit: {
      maxRequests: 20, // 20 requests per window
      windowMs: 60 * 1000, // 1 minute
    },
  });

  if (!protection.authorized || protection.response) {
    return protection.response;
  }

  try {
    const body = await req.json();
    const { messages } = body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages must be an array" },
        { status: 400 }
      );
    }

    // Limit number of messages to prevent abuse
    if (messages.length > 50) {
      return NextResponse.json(
        { error: "Too many messages in conversation" },
        { status: 400 }
      );
    }

    // Sanitize all message content
    const sanitizedMessages = messages.map((msg) => ({
      ...msg,
      content: typeof msg.content === "string"
        ? sanitizeInput(msg.content)
        : msg.content,
    }));

    // Verify user has active subscription or credits
    const { verifyAndConsumeCredit, logCreditUsage } = await import(
      "@/lib/credit-security"
    );

    const creditCheck = await verifyAndConsumeCredit(
      protection.userId!,
      "chat"
    );

    if (!creditCheck.allowed) {
      logCreditUsage({
        userId: protection.userId!,
        operation: "chat",
        timestamp: new Date(),
        success: false,
        reason: creditCheck.reason,
      });

      return NextResponse.json(
        { error: creditCheck.reason || "Access denied" },
        { status: 403 }
      );
    }

    // Log successful credit check
    logCreditUsage({
      userId: protection.userId!,
      operation: "chat",
      timestamp: new Date(),
      success: true,
      metadata: { messageCount: messages.length },
    });

    const result = streamText({
      model: openai.responses("gpt-4o"),
      messages: sanitizedMessages,
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

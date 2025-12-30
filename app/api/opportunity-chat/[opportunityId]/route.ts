import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/types/chat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const { opportunityId } = await params;

    if (!opportunityId) {
      return NextResponse.json(
        { error: "Missing opportunityId parameter" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find existing chat session
    const { data: chat, error: chatError } = await supabase
      .from("opportunity_chats")
      .select("id, opportunity_title, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunityId)
      .single();

    if (chatError || !chat) {
      // No existing chat found
      return NextResponse.json({
        exists: false,
        messages: [],
      });
    }

    // Load message history
    const { data: messages, error: messagesError } = await supabase
      .from("opportunity_chat_messages")
      .select("id, role, content, created_at, metadata")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error loading messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to load chat history" },
        { status: 500 }
      );
    }

    // Transform to ChatMessage format
    const chatMessages: ChatMessage[] = (messages || []).map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
      createdAt: msg.created_at,
      metadata: msg.metadata || undefined,
    }));

    return NextResponse.json({
      exists: true,
      chatId: chat.id,
      opportunityTitle: chat.opportunity_title,
      messages: chatMessages,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

"use client";

import { useState, useEffect, useRef } from "react";
import { SAMOpportunity } from "@/lib/sam-gov";
import type { ChatMessage } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Bot, User, Loader2 } from "lucide-react";

interface OpportunityChatInterfaceProps {
  opportunity: SAMOpportunity;
  onBack: () => void;
}

export function OpportunityChatInterface({
  opportunity,
  onBack,
}: OpportunityChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Load or initialize chat on mount
  useEffect(() => {
    const loadOrInitializeChat = async () => {
      try {
        console.log('[CHAT CLIENT] Loading chat for opportunity:', opportunity.noticeId);
        setIsInitializing(true);

        // Get auth token
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.error("[CHAT CLIENT] No session found");
          setIsInitializing(false);
          return;
        }

        console.log('[CHAT CLIENT] Session found, fetching chat history...');

        // Fetch existing chat history
        const response = await fetch(
          `/api/opportunity-chat/${opportunity.noticeId}`,
          {
            headers: {
              authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        console.log('[CHAT CLIENT] Chat history response:', response.status);
        const data = await response.json();
        console.log('[CHAT CLIENT] Chat data:', { exists: data.exists, messageCount: data.messages?.length });

        if (data.exists && data.messages && data.messages.length > 0) {
          // Check if there's at least one assistant response
          const hasAssistantResponse = data.messages.some((msg: ChatMessage) => msg.role === 'assistant');

          if (hasAssistantResponse) {
            // Existing chat with AI responses - load messages
            console.log('[CHAT CLIENT] Loading existing messages:', data.messages.length);
            setMessages(data.messages);
          } else {
            // Has messages but no AI response yet - don't auto-send again
            console.log('[CHAT CLIENT] Chat exists but no AI response yet, skipping auto-summary');
            setMessages(data.messages);
          }
        } else {
          // New chat - auto-generate summary (hide the prompt from UI)
          console.log('[CHAT CLIENT] New chat - sending auto-summary request');
          await sendMessage(
            "Please provide a high-level summary of this opportunity, highlighting the key requirements, location, square footage, and deadline.",
            { hideUserMessage: true }
          );
        }
      } catch (error) {
        console.error("[CHAT CLIENT] Error loading chat:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadOrInitializeChat();
  }, [opportunity.noticeId]);

  const sendMessage = async (messageText: string, options?: { hideUserMessage?: boolean }) => {
    if (!messageText.trim() || isLoading) {
      console.log('[CHAT CLIENT] sendMessage blocked:', {
        emptyMessage: !messageText.trim(),
        isLoading
      });
      return;
    }

    try {
      console.log('[CHAT CLIENT] Sending message:', messageText.substring(0, 50) + '...');
      setIsLoading(true);
      setStreamingMessage("");

      // Add user message to UI immediately (unless it's hidden like auto-summary)
      if (!options?.hideUserMessage) {
        const userMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          role: "user",
          content: messageText,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
      }
      setInput("");

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      console.log('[CHAT CLIENT] Making POST request to /api/opportunity-chat...');

      // Send message to API with streaming
      const response = await fetch("/api/opportunity-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          opportunityId: opportunity.noticeId,
          message: messageText,
          opportunityData: opportunity,
        }),
      });

      console.log('[CHAT CLIENT] POST response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      console.log('[CHAT CLIENT] Starting to read stream...');

      const decoder = new TextDecoder();
      let assistantMessageContent = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('[CHAT CLIENT] Stream ended. Total chunks:', chunkCount);
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "content_delta") {
                assistantMessageContent += data.content;
                setStreamingMessage(assistantMessageContent);
              } else if (data.type === "message_complete") {
                console.log('[CHAT CLIENT] Message complete. Length:', assistantMessageContent.length);
                // Finalize assistant message
                const assistantMessage: ChatMessage = {
                  id: `msg-${Date.now()}`,
                  role: "assistant",
                  content: assistantMessageContent,
                  createdAt: new Date().toISOString(),
                  metadata: data.metadata,
                };

                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingMessage("");
              } else if (data.type === "error") {
                console.error('[CHAT CLIENT] Error from server:', data.error);
                throw new Error(data.error);
              }
            } catch (e) {
              // Ignore JSON parse errors from incomplete chunks
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      console.log('[CHAT CLIENT] Streaming complete');
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold text-sm text-gray-900 line-clamp-1">
            {opportunity.title}
          </h2>
          <p className="text-xs text-gray-500">
            {opportunity.solicitationNumber}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading chat...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-indigo-200"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="max-w-[80%] rounded-lg p-3 bg-white text-gray-900 border border-gray-200">
                  <p className="text-sm whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="inline-block w-2 h-4 bg-indigo-600 animate-pulse ml-1"></span>
                  </p>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingMessage && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="max-w-[80%] rounded-lg p-3 bg-white text-gray-900 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    <p className="text-sm text-gray-600">Thinking...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this opportunity..."
            disabled={isLoading || isInitializing}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || isInitializing || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

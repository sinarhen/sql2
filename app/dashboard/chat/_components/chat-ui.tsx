"use client";

import { Bot, User, SendIcon, ArrowDownCircle } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { TipsPanel } from "./tips-panel";
import { ChatMessage } from "@/app/dashboard/actions";

interface ChatUiProps {
  chatId?: string;
  initialMessages: ChatMessage[];
  userId: string;
}

export default function ChatUi({ chatId, initialMessages }: ChatUiProps) {
  const router = useRouter();
  const showTips = !chatId || initialMessages.length === 0;
  
  // Transform DB messages format to AI SDK format
  const formattedInitialMessages = initialMessages.length > 0
    ? initialMessages.map(msg => ({
        id: msg.id,
        role: msg.role === 'tool' ? 'assistant' : msg.role, // Convert 'tool' role to 'assistant' for AI SDK
        content: msg.content,
      }))
    : [{ 
        id: 'system-welcome', 
        role: 'assistant' as const, 
        content: 'Hello! I\'m your AI Learning Assistant. How can I help you today? You can ask about your courses, assignments, or any learning concepts.' 
      }];
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    maxSteps: 3,
    initialMessages: formattedInitialMessages,
    onFinish: () => {
      router.refresh();
    },
  });

  return (
    <>
      {/* Main Chat Area */}
      <Card className="rounded-xl md:col-span-3 flex flex-col h-[70vh]">
        <ScrollArea className="flex-grow p-4 pt-2">
          {messages.length <= 1 && !chatId && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 pb-10">
              <Bot size={36} className="text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-xs font-medium mb-1">How can I help you today?</h3>
              <p className="text-[10px] text-muted-foreground max-w-xs">
                Ask me questions about your courses, assignments, deadlines, or for help with study materials
              </p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                  </AvatarFallback>
                </Avatar>

                <div className="grid gap-1 w-full">
                  <p className="text-xs font-medium">
                    {m.role === "user" ? "You" : "AI Assistant"}
                  </p>
                  <div className="rounded-xl bg-muted p-3 text-xs">
                    {m.content ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-xs prose-li:text-xs prose-headings:text-xs">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center text-[10px] text-muted-foreground italic">
                        <ArrowDownCircle size={12} />
                        <span>
                          Retrieving information ({m?.toolInvocations?.[0]?.toolName})...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <CardContent className="pt-2 border-t border-border/40">
          <form onSubmit={() => handleSubmit(undefined, {
            body: {
              chatId: chatId,
            }
          })} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="h-8 text-xs rounded-xl bg-background border border-border/40"
            />
            <Button 
              type="submit" 
              size="sm" 
              className="rounded-xl h-8 w-8 p-0" 
              disabled={isLoading}
            >
              <SendIcon size={14} />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tips Panel */}
      {showTips && <TipsPanel handleInputChange={handleInputChange} />}
    </>
  );
} 
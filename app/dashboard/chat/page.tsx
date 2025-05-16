"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, Bot, User, ArrowDownCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RagChatbotPage() {
  const [showTips, setShowTips] = useState(true);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    maxSteps: 3,
    initialMessages: [
      { 
        id: 'system-welcome', 
        role: 'assistant', 
        content: 'Hello! I\'m your AI Learning Assistant. How can I help you today? You can ask about your courses, assignments, or any learning concepts.' 
      }
    ],
  });

  // Handle example question click
  const handleExampleClick = (question: string) => {
    // Clear any previous input first
    handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>);
    
    // Use setTimeout to allow the input to update before submitting
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  };

  return (
    <div className="motion-preset-blur-up-sm motion-duration-500">
      <PageHeader className="mb-4">
        <PageHeaderTitle>AI Learning Assistant</PageHeaderTitle>
        <PageHeaderDescription>
          Ask questions about your courses, assignments, and more
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Chat Area */}
        <Card className="rounded-xl border-border/20 md:col-span-3 glass-card flex flex-col h-[70vh]">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-2">
                <Bot size={16} className="text-primary" />
                <span>AI Learning Assistant</span>
                {isLoading && (
                  <span className="animate-pulse text-[10px] text-muted-foreground">
                    Thinking...
                  </span>
                )}
              </CardTitle>
              <Button 
                size="sm" 
                className="rounded-xl text-xs h-7" 
                variant="outline"
                onClick={() => setShowTips(!showTips)}
              >
                {showTips ? "Hide Tips" : "Show Tips"}
              </Button>
            </div>
            <CardDescription className="text-[10px]">
              Ask me about your courses, assignments, deadlines, or for help with learning concepts
            </CardDescription>
          </CardHeader>

          <ScrollArea className="flex-grow p-4 pt-2">
            {messages.length <= 1 && (
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

                  <div className="grid gap-1">
                    <p className="text-xs font-medium">
                      {m.role === "user" ? "You" : "AI Assistant"}
                    </p>
                    <div className="rounded-xl bg-muted p-3 text-xs">
                      {m.content ? (
                        m.content
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

          <div className="p-4 pt-2 border-t border-border/40">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
          </div>
        </Card>

        {/* Tips Panel */}
        {showTips && (
          <Card className="rounded-xl border-border/20 md:col-span-1 glass-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Bot size={16} className="text-primary" />
                <span>Example Questions</span>
              </CardTitle>
              <CardDescription className="text-[10px]">
                Try asking these questions to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-2 flex flex-col ">
                <button
                  className="w-full justify-start flex-wrap whitespace-break-spaces  flex  text-left h-auto py-2 px-3 text-xs rounded-xl"
                  onClick={() => handleExampleClick("What courses am I enrolled in?")}
                >
                  <Badge className="rounded-xl bg-blue-600/20 text-blue-400 text-[10px] mr-2">Course</Badge>
                  What courses am I enrolled in?
                </button>
                
                <button
                  className="w-full justify-start flex flex-wrap break-all text-left h-auto py-2 px-3 text-xs rounded-xl"
                  onClick={() => handleExampleClick("When are my upcoming assignment deadlines?")}
                >
                  <Badge className="rounded-xl bg-purple-600/20 text-purple-400 text-[10px] mr-2">Assignment</Badge>
                  When are my upcoming assignment deadlines?
                </button>
                
                <button
                  className="w-full justify-start  flex flex-wrap text-left h-auto py-2 px-3 text-xs rounded-xl"
                  onClick={() => handleExampleClick("What's my average grade across all courses?")}
                >
                  <Badge className="rounded-xl bg-cyan-600/20 text-cyan-400 text-[10px] mr-2">Analytics</Badge>
                  What&apos;s my average grade across all courses?
                </button>
                
                <button
                  className="w-full justify-start flex flex-wrap text-left h-auto py-2 px-3 text-xs rounded-xl"
                  onClick={() => handleExampleClick("Can you explain how to normalize database tables?")}
                >
                  <Badge className="rounded-xl bg-indigo-600/20 text-indigo-400 text-[10px] mr-2">Learning</Badge>
                  Can you explain how to normalize database tables?
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
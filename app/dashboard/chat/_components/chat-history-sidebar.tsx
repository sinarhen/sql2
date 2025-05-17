"use client";

import { Bot, PlusCircle, Clock, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteChat } from "@/app/dashboard/actions";
import { Chat } from "@/app/dashboard/actions";

interface ChatHistorySidebarProps {
  chats: Chat[];
  activeChatId?: string;
}

export default function ChatHistorySidebar({ chats, activeChatId }: ChatHistorySidebarProps) {
  const router = useRouter();

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await deleteChat(chatId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <Card className="rounded-xl md:col-span-1 glass-card h-[70vh] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-primary" />
            <span>Chat History</span>
          </div>
          <Link href="/dashboard/chat">
            <Button size="sm" className="rounded-xl h-7 w-7 p-0" title="New chat">
              <PlusCircle size={14} />
              <span className="sr-only">New Chat</span>
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden flex-grow">
        <ScrollArea className="h-full px-4 pb-4">
          {chats.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[10px] text-muted-foreground">No chat history found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/dashboard/chat?chatId=${chat.id}`}
                  className={`
                    block p-2 rounded-xl text-xs
                    ${chat.id === activeChatId
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="line-clamp-1">{chat.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <Clock size={10} />
                    <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 
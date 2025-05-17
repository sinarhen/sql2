import { auth } from "@/lib/auth";
import { getUserChats, getChatWithMessages } from "@/app/dashboard/actions";
import { redirect } from "next/navigation";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import ChatHistorySidebar from "./_components/chat-history-sidebar";
import ChatUi from "./_components/chat-ui";

export default async function RagChatbotPage({
  searchParams,
}: {
  searchParams: { chatId?: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    redirect("/auth/login");
  }
  
  const chats = await getUserChats(userId);
  
  const currentChatId = (await searchParams).chatId;
  const currentChat = currentChatId
    ? await getChatWithMessages(currentChatId)
    : null;

  return (
    <div className="motion-preset-blur-up-sm motion-duration-500">
      <PageHeader className="mb-4">
        <PageHeaderTitle>AI Learning Assistant</PageHeaderTitle>
        <PageHeaderDescription>
          Ask questions about your courses, assignments, and more
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ChatHistorySidebar chats={chats} activeChatId={currentChatId} />
        
        <ChatUi 
          chatId={currentChatId} 
          initialMessages={currentChat?.messages || []} 
          userId={userId}
        />
      </div>
    </div>
  );
} 
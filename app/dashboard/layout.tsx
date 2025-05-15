import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./_components/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="pl-6 py-12 pr-4 mt-[57px] w-full overflow-hidden">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}

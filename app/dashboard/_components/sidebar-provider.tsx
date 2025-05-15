"use client";

import { ReactNode } from "react";
import { 
  SidebarProvider as UISidebarProvider,
  SidebarInset,
  Sidebar
} from "@/components/ui/sidebar";

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  return (
    <UISidebarProvider>
      <SidebarInset>
        <div className="p-6">
          {/* Outlet for pages */}
          <div className="h-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </UISidebarProvider>
  );
} 
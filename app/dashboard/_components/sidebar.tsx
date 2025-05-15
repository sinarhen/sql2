"use client";

import { useSession } from "next-auth/react";
import { Home, Book, Users, User, Settings, FileText, BarChart } from "lucide-react";

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
  Sidebar,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "student";
  if (userRole === "admin") {
    return <AdminSidebar />;
  } else if (userRole === "lecturer") {
    return <LecturerSidebar />;
  }
  return <StudentSidebar />;
}

function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2">
          <span className="text-xl font-semibold">Admin Dashboard</span>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Home className="text-blue-500" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="text-purple-500" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Book className="text-indigo-500" />
                  <span>Courses</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="text-blue-500" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart className="text-purple-500" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          Admin Panel v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function LecturerSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2">
          <span className="text-xl font-semibold">Lecturer Dashboard</span>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Home className="text-blue-500" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Book className="text-indigo-500" />
                  <span>Courses</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="text-purple-500" />
                  <span>Students</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="text-blue-500" />
                  <span>Assignments</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart className="text-purple-500" />
                  <span>Grades</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          Lecturer Portal v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function StudentSidebar() {
  return (
    <Sidebar variant="floating"  className="my-auto top-5">
      <SidebarHeader className="font-semibold">

          Student Dashboard
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Home className="text-blue-500" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Book className="text-indigo-500" />
                  <span>My Courses</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="text-blue-500" />
                  <span>Assignments</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart className="text-purple-500" />
                  <span>My Grades</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User className="text-indigo-500" />
                  <span>My Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="text-blue-500" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          Student Portal v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 
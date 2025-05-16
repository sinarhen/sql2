import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/drizzle/schema";
import { eq } from "drizzle-orm";
import { StudentDashboard } from "./_components/student-dashboard";
import { LecturerDashboard } from "./_components/lecturer-dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    redirect("/auth/login");
  }
  
  // Get user to determine role
  const user = await db.select().from(users).where(eq(users.id, userId)).then(res => res[0]);
  
  if (!user) {
    redirect("/auth/login");
  }
  
  // Render different dashboard based on user role
  if (user.role === "lecturer" || user.role === "admin") {
    return <LecturerDashboard userId={userId} />;
  } else {
    return <StudentDashboard userId={userId} />;
  }
} 
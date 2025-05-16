import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/drizzle/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LecturerProfile } from "./_components/lecturer-profile";
import { StudentProfile } from "./_components/student-profile";

export default async function ProfilePage() {
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
  
  // Render different profile based on user role
  if (user.role === "lecturer" || user.role === "admin") {
    return <LecturerProfile userId={userId} />;
  } else {
    return <StudentProfile userId={userId} />;
  }
} 
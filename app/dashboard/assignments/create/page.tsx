import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/drizzle/schema";
import { auth } from "@/lib/auth";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { CreateAssignmentForm } from "../_components/create-assignment-form";
import { getLecturerCourses } from "../../actions";

export default async function CreateAssignmentPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userResult = await db.query.users.findFirst({
    where: eq(users.email, session.user.email || ""),
  });
  
  if (!userResult) {
    redirect("/auth/login");
  }
  
  if (userResult.role !== "lecturer" && userResult.role !== "admin") {
    redirect("/dashboard/assignments");
  }
  
  // Get courses created by this lecturer
  const lecturerCourses = await getLecturerCourses(userResult.id);
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderTitle>Create Assignment</PageHeaderTitle>
        <PageHeaderDescription>Create a new assignment for your courses</PageHeaderDescription>
      </PageHeader>
      
      <CreateAssignmentForm courses={lecturerCourses} />
    </div>
  );
} 
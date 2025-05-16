import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/components/ui/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { CreateCourseForm } from "./_components/create-course-form";

export default async function CreateCoursePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userResult = await db.query.users.findFirst({
    where: eq(users.email, session.user.email || ""),
  });
  
  if (!userResult) {
    notFound();
  }
  
  // Only lecturers and admins can create courses
  if (userResult.role !== "lecturer" && userResult.role !== "admin") {
    redirect("/dashboard/courses");
  }
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>Create New Course</PageHeaderTitle>
            <PageHeaderDescription>Create a new course for students to enroll in</PageHeaderDescription>
          </PageHeader>
          
          <Link href="/dashboard/courses">
            <Button 
              size="sm" 
              variant="outline"
              className="rounded-xl text-xs"
            >
              Back to Courses
            </Button>
          </Link>
        </div>
        
        <CreateCourseForm lecturerId={userResult.id} />
      </div>
    </div>
  );
} 
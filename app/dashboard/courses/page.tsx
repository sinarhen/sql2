import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { courses, userCourses, users } from "@/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "../_components/page-header";
import { MyCoursesList } from "./_components/my-courses-list";

export default async function MyCoursesPage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userResult = await db.query.users.findFirst({
    where: eq(users.email, session.user.email || ""),
  });
  
  if (!userResult) {
    notFound();
  }
  
  // Students only
  if (userResult.role !== "student") {
    redirect("/dashboard");
  }
  
  // Get all courses the student is enrolled in
  const enrollments = await db.query.userCourses.findMany({
    where: eq(userCourses.userId, userResult.id),
  });
  
  const enrolledCourseIds = enrollments.map(enrollment => enrollment.courseId);
  
  const enrolledCourses = enrolledCourseIds.length > 0
    ? await db.query.courses.findMany({
        where: eq(courses.id, enrolledCourseIds[0]),
      })
    : [];
  
  return (
    <div>
      <PageHeader>
        <PageHeaderTitle>My Courses</PageHeaderTitle>
        <PageHeaderDescription>View and manage your course enrollments</PageHeaderDescription>
      </PageHeader>
      
      <div className="flex flex-col gap-6">
        <MyCoursesList courses={enrolledCourses} userId={userResult.id} />
      </div>
    </div>
  );
} 
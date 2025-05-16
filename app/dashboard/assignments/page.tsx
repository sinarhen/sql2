import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { assignments, courses, users, userCourses } from "@/components/ui/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "../../../components/page-header";
import { AssignmentsList } from "./_components/assignments-list";
import { AddAssignmentForm } from "./_components/add-assignment-form";
import { auth } from "@/lib/auth";

export default async function AssignmentsPage() {
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
  
  // Get user courses
  const userCoursesList = await db.query.userCourses.findMany({
    where: eq(userCourses.userId, userResult.id),
  });
  
  const courseIds = userCoursesList.map(uc => uc.courseId);
  
  // Get courses details
  const coursesData = courseIds.length > 0
    ? await db.query.courses.findMany({
        where: eq(courses.id, courseIds[0]),
      })
    : [];
  
  // Get assignments for these courses
  const userAssignments = courseIds.length > 0
    ? await db.query.assignments.findMany({
        where: eq(assignments.courseId, courseIds[0]),
        orderBy: assignments.deadline,
      })
    : [];
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderTitle>Assignments</PageHeaderTitle>
        <PageHeaderDescription>{userResult.role === "lecturer" ? "Manage and track student assignments" : "Your Assignments"}</PageHeaderDescription>
      </PageHeader>
      
      {userResult.role === "lecturer" && (
        <AddAssignmentForm courses={coursesData} />
      )}
      
      <AssignmentsList 
        assignments={userAssignments} 
        courses={coursesData}
        userRole={userResult.role}
        userId={userResult.id}
      />
    </div>
  );
} 
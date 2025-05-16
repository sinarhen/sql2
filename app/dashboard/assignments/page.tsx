import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { assignments, users } from "@/lib/db/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { AssignmentsList } from "./_components/assignments-list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getLecturerCourses, getStudentAssignments } from "../actions";

export default async function AssignmentsPage() {
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
  
  let userAssignments = [];
  let courses = [];
  
  if (userResult.role === "student") {
    // Get assignments from all courses the student is enrolled in
    userAssignments = await getStudentAssignments(userResult.id);
    
    // Extract unique courses from assignments
    const uniqueCourses = new Map();
    userAssignments.forEach(assignment => {
      if (!uniqueCourses.has(assignment.courseId)) {
        uniqueCourses.set(assignment.courseId, {
          id: assignment.courseId,
          name: assignment.courseName
        });
      }
    });
    courses = Array.from(uniqueCourses.values());
  } else {
    // For lecturers, get courses they created
    courses = await getLecturerCourses(userResult.id);
    
    // Get assignments from these courses
    for (const course of courses) {
      const courseAssignments = await db.query.assignments.findMany({
        where: eq(assignments.courseId, course.id),
        orderBy: assignments.deadline,
      });
      
      // Add course name to each assignment
      const assignmentsWithCourse = courseAssignments.map(assignment => ({
        ...assignment,
        courseName: course.name
      }));
      
      userAssignments.push(...assignmentsWithCourse);
    }
  }
  
  return (
    <div className="flex flex-col gap-6 motion-preset-blur-up-sm motion-duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 motion-preset-blur-up-sm motion-duration-600 motion-delay-100">
        <PageHeader className="mb-0">
          <PageHeaderTitle>Assignments</PageHeaderTitle>
          <PageHeaderDescription>
            {userResult.role === "lecturer" ? "Manage and track student assignments" : "Your Assignments"}
          </PageHeaderDescription>
        </PageHeader>
        
        {(userResult.role === "lecturer" || userResult.role === "admin") && (
          <Link href="/dashboard/assignments/create">
            <Button size="sm" className="rounded-xl text-xs gap-1 motion-preset-blur-right-sm motion-duration-500 motion-delay-200">
              <PlusIcon size={14} />
              Create Assignment
            </Button>
          </Link>
        )}
      </div>
      
      <div className="motion-preset-blur-up-sm motion-duration-700 motion-delay-300 motion-stagger-children">
        <AssignmentsList 
          assignments={userAssignments} 
          courses={courses}
          userRole={userResult.role}
        />
      </div>
    </div>
  );
} 
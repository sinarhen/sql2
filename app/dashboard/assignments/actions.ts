"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assignments, assignmentSubmissions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

interface CreateAssignmentParams {
  name: string;
  courseId: string;
  deadline: number;
}

export async function createAssignment(params: CreateAssignmentParams) {
  const { name, courseId, deadline } = params;
  
  const [newAssignment] = await db
    .insert(assignments)
    .values({
      name,
      courseId,
      deadline: new Date(deadline),
    })
    .returning();

  revalidatePath("/dashboard/assignments");
  return newAssignment;
}

interface SubmitAssignmentParams {
  assignmentId: string;
  studentId: string;
  content: string;
}

export async function submitAssignment(params: SubmitAssignmentParams) {
  const { assignmentId, studentId, content } = params;
  
  // Check if already submitted
  const existingSubmission = await db.query.assignmentSubmissions.findFirst({
    where: and(
      eq(assignmentSubmissions.assignmentId, assignmentId),
      eq(assignmentSubmissions.studentId, studentId)
    ),
  });

  if (existingSubmission) {
    // Update existing submission
    await db
      .update(assignmentSubmissions)
      .set({
        submission: new Date(),
        content,
      })
      .where(
        and(
          eq(assignmentSubmissions.assignmentId, assignmentId),
          eq(assignmentSubmissions.studentId, studentId)
        )
      );
  } else {
    // Create new submission
    await db
      .insert(assignmentSubmissions)
      .values({
        assignmentId,
        studentId,
        content,
        submission: new Date(),
      });
  }

  revalidatePath("/dashboard/assignments");
  return { success: true };
}

interface GradeAssignmentParams {
  assignmentId: string;
  studentId: string;
  rating: number;
}

export async function gradeAssignment(params: GradeAssignmentParams) {
  const { assignmentId, studentId, rating } = params;
  
  await db
    .update(assignmentSubmissions)
    .set({
      rating,
    })
    .where(
      and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, studentId)
      )
    );

  revalidatePath("/dashboard/assignments");
  return { success: true };
} 
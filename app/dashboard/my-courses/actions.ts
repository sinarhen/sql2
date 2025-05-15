"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { courses, userCourses } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function createCourse(name: string, lecturerId: string) {
  // Create the course
  const [newCourse] = await db
    .insert(courses)
    .values({
      name,
    })
    .returning();

  // Enroll the lecturer in the course
  await db.insert(userCourses).values({
    userId: lecturerId,
    courseId: newCourse.id,
  });

  revalidatePath("/dashboard/courses");
  return newCourse;
}

export async function enrollInCourse(courseId: string, userId: string) {
  // Check if already enrolled
  const existingEnrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, userId),
      eq(userCourses.courseId, courseId)
    ),
  });

  if (existingEnrollment) {
    return { success: false, message: "Already enrolled" };
  }

  // Create enrollment
  await db.insert(userCourses).values({
    userId,
    courseId,
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/my-courses");
  return { success: true };
}

export async function unenrollFromCourse(courseId: string, userId: string) {
  await db
    .delete(userCourses)
    .where(
      and(
        eq(userCourses.userId, userId),
        eq(userCourses.courseId, courseId)
      )
    );

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/my-courses");
  return { success: true };
} 
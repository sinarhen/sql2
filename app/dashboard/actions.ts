"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { 
  users, 
  courses, 
  assignments, 
  assignmentSubmissions,
  userCourses,
  forms,
  formSubmissions
} from "@/drizzle/schema";
import { eq, sql, count, avg, max, min, desc, and } from "drizzle-orm";

export type StudentStats = {
  totalStudents: number;
  newStudentsLastMonth: number;
  totalSubmissions: number;
  submissionsLastMonth: number;
  averageScore: number | null;
};

export type RecentActivity = {
  id: string;
  studentId: string;
  assignmentId: string;
  rating: number | null;
  submission: number | Date;
  studentName: string;
  assignmentName: string;
  courseName: string;
};

export async function getUserById(id: string) {
    return await db.select().from(users).where(eq(users.id, id))
}

// Analytics for overall student statistics
export async function getStudentStats(): Promise<StudentStats> {
  const totalStudents = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "student"))
    .then((res) => res[0].count);

  const newStudentsLastMonth = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.role, "student"),
        sql`${users.createdAt} > datetime('now', '-1 month')`
      )
    )
    .then((res) => res[0].count);

  const totalSubmissions = await db
    .select({ count: count() })
    .from(assignmentSubmissions)
    .then((res) => res[0].count);

  const submissionsLastMonth = await db
    .select({ count: count() })
    .from(assignmentSubmissions)
    .where(sql`${assignmentSubmissions.submission} > datetime('now', '-1 month')`)
    .then((res) => res[0].count);

  const avgScore = await db
    .select({ avg: avg(assignmentSubmissions.rating) })
    .from(assignmentSubmissions)
    .where(sql`${assignmentSubmissions.rating} IS NOT NULL`)
    .then((res) => res[0].avg);

  return {
    totalStudents,
    newStudentsLastMonth,
    totalSubmissions,
    submissionsLastMonth,
    averageScore: avgScore ? Number(avgScore) : null
  };
}

// Get recent submissions for activity feed
export async function getRecentActivities(limit: number): Promise<RecentActivity[]> {
  const recentSubmissions = await db
    .select({
      id: assignmentSubmissions.id,
      studentId: assignmentSubmissions.studentId,
      assignmentId: assignmentSubmissions.assignmentId,
      rating: assignmentSubmissions.rating,
      submission: assignmentSubmissions.submission,
      studentName: users.name,
      assignmentName: assignments.name,
      courseName: courses.name
    })
    .from(assignmentSubmissions)
    .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
    .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .orderBy(desc(assignmentSubmissions.submission))
    .limit(limit);

  return recentSubmissions.map((submission) => ({
    id: submission.id,
    studentId: submission.studentId,
    assignmentId: submission.assignmentId,
    rating: submission.rating,
    submission: submission.submission,
    studentName: submission.studentName,
    assignmentName: submission.assignmentName,
    courseName: submission.courseName
  }));
}

// Get grade distribution data
export async function getGradeDistribution() {
  const ranges = [
    { min: 0, max: 59, label: '0-59' },
    { min: 60, max: 69, label: '60-69' },
    { min: 70, max: 79, label: '70-79' },
    { min: 80, max: 89, label: '80-89' },
    { min: 90, max: 100, label: '90-100' }
  ];

  const distribution = await Promise.all(
    ranges.map(async (range) => {
      const result = await db
        .select({ count: count() })
        .from(assignmentSubmissions)
        .where(
          and(
            sql`${assignmentSubmissions.rating} >= ${range.min}`,
            sql`${assignmentSubmissions.rating} <= ${range.max}`
          )
        );
      
      return {
        range: range.label,
        count: result[0].count || 0
      };
    })
  );

  return distribution;
}

// Get course performance data
export async function getCoursePerformance() {
  const courseStats = await db
    .select({
      courseId: courses.id,
      courseName: courses.name,
      avgScore: avg(assignmentSubmissions.rating),
      submissions: count(assignmentSubmissions.id),
      maxScore: max(assignmentSubmissions.rating),
      minScore: min(assignmentSubmissions.rating)
    })
    .from(courses)
    .leftJoin(assignments, eq(assignments.courseId, courses.id))
    .leftJoin(assignmentSubmissions, eq(assignmentSubmissions.assignmentId, assignments.id))
    .groupBy(courses.id, courses.name)
    .having(sql`count(${assignmentSubmissions.id}) > 0`);

  return courseStats;
}

// Get assignment completion data
export async function getAssignmentCompletionData() {
  const totalStudentsResult = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "student"));
  
  const totalStudents = totalStudentsResult[0].count || 0;

  const assignmentData = await db
    .select({
      assignmentId: assignments.id,
      assignmentName: assignments.name,
      courseId: assignments.courseId,
      courseName: courses.name,
      deadline: assignments.deadline,
      submissionsCount: count(assignmentSubmissions.id),
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .leftJoin(assignmentSubmissions, eq(assignmentSubmissions.assignmentId, assignments.id))
    .groupBy(assignments.id, assignments.name, courses.name, assignments.deadline, assignments.courseId);

  return assignmentData.map(assignment => ({
    ...assignment,
    completionRate: (assignment.submissionsCount / totalStudents) * 100
  }));
}

// Get performance trends over time (last 6 months)
export async function getPerformanceTrends() {
  const months = 6;
  const trends = [];

  for (let i = 0; i < months; i++) {
    const monthData = await db
      .select({
        avgScore: avg(assignmentSubmissions.rating),
        count: count()
      })
      .from(assignmentSubmissions)
      .where(
        sql`${assignmentSubmissions.submission} BETWEEN datetime('now', '-${i+1} month') AND datetime('now', '-${i} month')`
      );

    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    trends.unshift({
      month: monthName,
      average: monthData[0].avgScore || 0,
      submissions: monthData[0].count || 0
    });
  }

  return trends;
}

// Course actions
export async function createCourse(name: string, lecturerId: string) {
  const [newCourse] = await db
    .insert(courses)
    .values({
      name,
    })
    .returning();

  await db.insert(userCourses).values({
    userId: lecturerId,
    courseId: newCourse.id,
  });

  revalidatePath("/dashboard/courses");
  return newCourse;
}

export async function getAllCourses(userId?: string) {
  const allCourses = await db.select().from(courses);
  
  if (!userId) {
    return allCourses.map(course => ({
      ...course,
      isUserEnrolled: false
    }));
  }

  const userEnrollments = await db.query.userCourses.findMany({
    where: eq(userCourses.userId, userId),
  });

  const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId));
  
  return allCourses.map(course => ({
    ...course,
    isUserEnrolled: enrolledCourseIds.has(course.id)
  }));
}

export async function getCourseById(id: string) {
  return await db.select().from(courses).where(eq(courses.id, id));
}

export async function enrollInCourse(courseId: string, userId: string) {
  const existingEnrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, userId),
      eq(userCourses.courseId, courseId)
    ),
  });

  if (existingEnrollment) {
    return { success: false, message: "Already enrolled" };
  }

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

export async function getUserCourses(userId: string) {
  const enrollments = await db.query.userCourses.findMany({
    where: eq(userCourses.userId, userId),
    with: {
      course: true
    }
  });
  
  return enrollments.map(enrollment => enrollment.course) as (typeof courses.$inferSelect)[];
}

// Assignment actions
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
  
  const existingSubmission = await db.query.assignmentSubmissions.findFirst({
    where: and(
      eq(assignmentSubmissions.assignmentId, assignmentId),
      eq(assignmentSubmissions.studentId, studentId)
    ),
  });

  if (existingSubmission) {
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

// Form actions
interface CreateFormParams {
  name: string;
  end: number;
}

export async function createForm(params: CreateFormParams) {
  const { name, end } = params;
  
  const [newForm] = await db
    .insert(forms)
    .values({
      name,
      end: new Date(end),
    })
    .returning();

  revalidatePath("/dashboard/forms");
  return newForm;
}

interface SubmitFormParams {
  formId: string;
  userId: string;
  content: string;
}

export async function submitForm(params: SubmitFormParams) {
  const { formId, userId, content } = params;
  
  const existingSubmission = await db.query.formSubmissions.findFirst({
    where: and(
      eq(formSubmissions.formId, formId),
      eq(formSubmissions.userId, userId)
    ),
  });

  if (existingSubmission) {
    await db
      .update(formSubmissions)
      .set({
        content,
      })
      .where(
        and(
          eq(formSubmissions.formId, formId),
          eq(formSubmissions.userId, userId)
        )
      );
  } else {
    await db
      .insert(formSubmissions)
      .values({
        formId,
        userId,
        content,
      });
  }

  revalidatePath("/dashboard/forms");
  return { success: true };
}

export async function viewFormSubmissions(formId: string) {
  const submissions = await db.query.formSubmissions.findMany({
    where: eq(formSubmissions.formId, formId),
    with: {
      user: true,
    },
  });
  
  return submissions;
}

// Import actions
type ImportedStudent = {
  name: string;
  email: string;
  passwordHash: string;
};

type ImportedCourse = {
  name: string;
};

type ImportedAssignment = {
  name: string;
  courseId: string;
  deadline: Date;
};

type ImportedSubmission = {
  assignmentId: string;
  studentId: string;
  rating: number;
  submission: Date;
};

export async function importStudents(students: ImportedStudent[]) {
  try {
    const inserts = [];
    
    for (const student of students) {
      const insert = db.insert(users).values({
        name: student.name,
        email: student.email,
        passwordHash: student.passwordHash,
        role: "student",
      });
      
      inserts.push(insert);
    }
    
    await Promise.all(inserts);
    revalidatePath("/dashboard");
    
    return { success: true, count: students.length };
  } catch (error) {
    console.error("Error importing students:", error);
    return { success: false, error: "Failed to import students" };
  }
}

export async function importCourses(importedCourses: ImportedCourse[]) {
  try {
    const inserts = [];
    
    for (const course of importedCourses) {
      const insert = db.insert(courses).values({
        name: course.name,
      });
      
      inserts.push(insert);
    }
    
    await Promise.all(inserts);
    revalidatePath("/dashboard");
    
    return { success: true, count: importedCourses.length };
  } catch (error) {
    console.error("Error importing courses:", error);
    return { success: false, error: "Failed to import courses" };
  }
}

export async function importAssignments(importedAssignments: ImportedAssignment[]) {
  try {
    const inserts = [];
    
    for (const assignment of importedAssignments) {
      const insert = db.insert(assignments).values({
        name: assignment.name,
        courseId: assignment.courseId,
        deadline: assignment.deadline,
      });
      
      inserts.push(insert);
    }
    
    await Promise.all(inserts);
    revalidatePath("/dashboard");
    
    return { success: true, count: importedAssignments.length };
  } catch (error) {
    console.error("Error importing assignments:", error);
    return { success: false, error: "Failed to import assignments" };
  }
}

export async function importSubmissions(submissions: ImportedSubmission[]) {
  try {
    const inserts = [];
    
    for (const submission of submissions) {
      const insert = db.insert(assignmentSubmissions).values({
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        rating: submission.rating,
        submission: submission.submission,
      });
      
      inserts.push(insert);
    }
    
    await Promise.all(inserts);
    revalidatePath("/dashboard");
    
    return { success: true, count: submissions.length };
  } catch (error) {
    console.error("Error importing submissions:", error);
    return { success: false, error: "Failed to import submissions" };
  }
}

export async function processCsvImport(fileContent: string, type: 'students' | 'courses' | 'assignments' | 'submissions') {
  try {
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const entry: Record<string, string> = {};
      
      for (let j = 0; j < headers.length; j++) {
        entry[headers[j].trim()] = values[j].trim();
      }
      
      data.push(entry);
    }
    
    let result;
    
    switch (type) {
      case 'students':
        result = await importStudents(data as unknown as ImportedStudent[]);
        break;
      case 'courses':
        result = await importCourses(data as unknown as ImportedCourse[]);
        break;
      case 'assignments':
        result = await importAssignments(data as unknown as ImportedAssignment[]);
        break;
      case 'submissions':
        result = await importSubmissions(data as unknown as ImportedSubmission[]);
        break;
    }
    
    return result;
  } catch (error) {
    console.error("Error processing CSV import:", error);
    return { success: false, error: "Failed to process CSV data" };
  }
} 
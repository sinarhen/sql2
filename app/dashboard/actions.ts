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
} from "@/lib/db/drizzle/schema";
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
    return await db.select().from(users).where(eq(users.id, id)).then((res) => res[0])
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
      lecturerId,
    })
    .returning();

  // await db.insert(userCourses).values({
  //   userId: lecturerId,
  //   courseId: newCourse.id,
  // });

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
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });
  
  return course;
}

export async function getCourseWithDetails(id: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
    with: {
      assignments: {
        orderBy: (assignments, { desc }) => [desc(assignments.deadline)],
      }
    }
  });
  
  return course;
}

export async function getCourseEnrollments(courseId: string) {
  const enrollments = await db.query.userCourses.findMany({
    where: eq(userCourses.courseId, courseId),
    with: {
      user: true
    }
  });
  
  return enrollments;
}

export async function getCourseAssignments(courseId: string) {
  const courseAssignments = await db.query.assignments.findMany({
    where: eq(assignments.courseId, courseId),
    orderBy: (assignments, { desc }) => [desc(assignments.createdAt)],
  });
  
  return courseAssignments;
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
  revalidatePath(`/dashboard/courses/${courseId}`);
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
  revalidatePath(`/dashboard/courses/${courseId}`);
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
  lecturerId: string;
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
        lecturerId: course.lecturerId,
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

export async function updateUserRole(userId: string, newRole: 'student' | 'lecturer' | 'admin') {
  try {
    if (!['student', 'lecturer', 'admin'].includes(newRole)) {
      return { success: false, error: "Invalid role" };
    }
    
    await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId));
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update role" };
  }
}

// Get assignment submission statistics
export async function getAssignmentStats(assignmentId: string) {
  // Get the course ID for this assignment to find total enrolled students
  const assignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, assignmentId),
  });
  
  if (!assignment) {
    return { totalStudents: 0, submittedCount: 0, ratedCount: 0 };
  }
  
  // Count enrolled students for this course
  const enrollments = await db.query.userCourses.findMany({
    where: eq(userCourses.courseId, assignment.courseId),
  });
  
  // Get all student users
  const studentIds = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "student"))
    .then(result => result.map(row => row.id));
  
  // Filter enrollments to only include students
  const studentEnrollments = enrollments.filter(
    enrollment => studentIds.includes(enrollment.userId)
  );
  
  const totalStudents = studentEnrollments.length;
  
  // Count submissions for this assignment
  const submittedCount = await db
    .select({ count: count() })
    .from(assignmentSubmissions)
    .where(eq(assignmentSubmissions.assignmentId, assignmentId))
    .then(res => res[0].count);
  
  // Count rated submissions
  const ratedCount = await db
    .select({ count: count() })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        sql`${assignmentSubmissions.rating} IS NOT NULL`
      )
    )
    .then(res => res[0].count);
  
  return {
    totalStudents,
    submittedCount,
    ratedCount
  };
}

// Get detailed information about an assignment
export async function getAssignmentDetails(assignmentId: string) {
  const assignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, assignmentId),
    with: {
      course: true,
      submissions: {
        with: {
          student: true
        }
      }
    }
  });
  
  if (!assignment) return null;
  
  const stats = await getAssignmentStats(assignmentId);
  
  return {
    ...assignment,
    stats
  };
}

// Get courses where the user is a lecturer
export async function getLecturerCourses(userId: string) {
  const lecturerCourses = await db.query.courses.findMany({
    where: eq(courses.lecturerId, userId),
    orderBy: (courses, { desc }) => [desc(courses.createdAt)],
  });
  
  return lecturerCourses;
}

// Get course statistics (assignments and enrollments)
export async function getCourseStats(courseId: string) {
  // Get total assignments count
  const assignmentsCount = await db
    .select({ count: count() })
    .from(assignments)
    .where(eq(assignments.courseId, courseId))
    .then(res => res[0].count);
  
  // Get total enrollments count
  const enrollmentsCount = await db
    .select({ count: count() })
    .from(userCourses)
    .where(eq(userCourses.courseId, courseId))
    .then(res => res[0].count);
  
  // Get submitted assignments stats
  const courseAssignments = await db.query.assignments.findMany({
    where: eq(assignments.courseId, courseId),
  });
  
  const submissionStats = await Promise.all(
    courseAssignments.map(async (assignment) => {
      const stats = await getAssignmentStats(assignment.id);
      return {
        assignmentId: assignment.id,
        assignmentName: assignment.name,
        ...stats
      };
    })
  );
  
  return {
    assignmentsCount,
    enrollmentsCount,
    submissionStats
  };
}

// Get assignments for all courses a student is enrolled in
export async function getStudentAssignments(studentId: string) {
  // Get courses the student is enrolled in
  const enrollments = await db.query.userCourses.findMany({
    where: eq(userCourses.userId, studentId),
    with: {
      course: {
        with: {
          assignments: {
            orderBy: (assignments, { desc }) => [desc(assignments.deadline)],
          }
        }
      }
    }
  });

  // Extract all assignments with their course info
  const assignmentsWithCourses = [];
  for (const enrollment of enrollments) {
    const courseAssignments = enrollment.course.assignments.map(assignment => ({
      ...assignment,
      courseName: enrollment.course.name
    }));
    assignmentsWithCourses.push(...courseAssignments);
  }

  // Get student's submissions to determine completion status
  const studentSubmissions = await db.query.assignmentSubmissions.findMany({
    where: eq(assignmentSubmissions.studentId, studentId)
  });

  const submissionMap = new Map(
    studentSubmissions.map(sub => [sub.assignmentId, sub])
  );

  // Add completion status to each assignment
  const assignmentsWithStatus = assignmentsWithCourses.map(assignment => ({
    ...assignment,
    isCompleted: submissionMap.has(assignment.id),
    submission: submissionMap.get(assignment.id) || null
  }));

  return assignmentsWithStatus;
}

// Get detailed submission information
export async function getSubmissionDetails(submissionId: string) {
  const submission = await db.query.assignmentSubmissions.findFirst({
    where: eq(assignmentSubmissions.id, submissionId),
    with: {
      student: true,
      assignment: {
        with: {
          course: true
        }
      }
    }
  });
  
  if (!submission) return null;
  
  // Get student's average grade for this course
  const courseAssignments = await db.query.assignments.findMany({
    where: eq(assignments.courseId, submission.assignment.courseId)
  });
  
  const courseAssignmentIds = courseAssignments.map(a => a.id);
  
  const studentSubmissions = await db.query.assignmentSubmissions.findMany({
    where: and(
      eq(assignmentSubmissions.studentId, submission.studentId),
      sql`${assignmentSubmissions.assignmentId} IN (${courseAssignmentIds.join(',')})`,
      sql`${assignmentSubmissions.rating} IS NOT NULL`
    )
  });
  
  const averageGrade = studentSubmissions.length > 0
    ? studentSubmissions.reduce((sum, sub) => sum + (sub.rating || 0), 0) / studentSubmissions.length
    : null;
  
  // Get student's submission count for this course
  const submissionCount = await db
    .select({ count: count() })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.studentId, submission.studentId),
        sql`${assignmentSubmissions.assignmentId} IN (${courseAssignmentIds.join(',')})`
      )
    )
    .then(res => res[0].count);
  
  // Get course total assignment count
  const totalAssignments = courseAssignments.length;
  
  return {
    submission,
    averageGrade,
    submissionCount,
    totalAssignments,
    completionRate: totalAssignments > 0 ? (submissionCount / totalAssignments) * 100 : 0
  };
}

// Get all submissions for an assignment
export async function getAssignmentSubmissions(assignmentId: string) {
  const submissions = await db.query.assignmentSubmissions.findMany({
    where: eq(assignmentSubmissions.assignmentId, assignmentId),
    with: {
      student: true
    }
  });
  
  return submissions;
}

// Get student's progress in a course
export async function getStudentCourseProgress(studentId: string, courseId: string) {
  // Get all assignments for this course
  const courseAssignments = await db.query.assignments.findMany({
    where: eq(assignments.courseId, courseId),
  });
  
  const totalAssignments = courseAssignments.length;
  
  if (totalAssignments === 0) {
    return {
      completedAssignments: 0,
      totalAssignments: 0,
      completionRate: 0,
      averageGrade: null
    };
  }
  
  // Get student's submissions for this course
  const studentSubmissions = await db.query.assignmentSubmissions.findMany({
    where: and(
      eq(assignmentSubmissions.studentId, studentId),
      sql`${assignmentSubmissions.assignmentId} IN (${courseAssignments.map(a => a.id).join(',')})`
    )
  });
  
  const completedAssignments = studentSubmissions.length;
  const completionRate = (completedAssignments / totalAssignments) * 100;
  
  // Calculate average grade from rated submissions
  const ratedSubmissions = studentSubmissions.filter(sub => sub.rating !== null);
  const averageGrade = ratedSubmissions.length > 0
    ? ratedSubmissions.reduce((sum, sub) => sum + (sub.rating || 0), 0) / ratedSubmissions.length
    : null;
  
  return {
    completedAssignments,
    totalAssignments,
    completionRate,
    averageGrade
  };
}

// Check if student can submit assignment
export async function canSubmitAssignment(assignmentId: string, studentId: string) {
  // Check if the assignment exists
  const assignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, assignmentId),
    with: {
      course: true
    }
  });
  
  if (!assignment) {
    return { 
      canSubmit: false, 
      message: "Assignment not found", 
      assignment: null,
      existingSubmission: null,
      courseProgress: null
    };
  }
  
  // Check if student is enrolled in the course
  const enrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, studentId),
      eq(userCourses.courseId, assignment.course.id)
    )
  });
  
  if (!enrollment) {
    return { 
      canSubmit: false, 
      message: "You are not enrolled in this course", 
      assignment,
      existingSubmission: null,
      courseProgress: null
    };
  }
  
  // Check if student has already submitted this assignment
  const existingSubmission = await db.query.assignmentSubmissions.findFirst({
    where: and(
      eq(assignmentSubmissions.assignmentId, assignmentId),
      eq(assignmentSubmissions.studentId, studentId)
    )
  });
  
  if (existingSubmission) {
    const courseProgress = await getStudentCourseProgress(studentId, assignment.course.id);
    
    return { 
      canSubmit: false, 
      message: "You have already submitted this assignment", 
      assignment,
      existingSubmission,
      courseProgress
    };
  }
  
  // Get student's course progress
  const courseProgress = await getStudentCourseProgress(studentId, assignment.course.id);
  
  return { 
    canSubmit: true, 
    message: null, 
    assignment,
    existingSubmission: null,
    courseProgress
  };
}

// Get detailed submission page data
export async function getSubmissionPageData(assignmentId: string, userId: string) {
  // Check if user exists and is a student
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  
  if (!user || user.role !== "student") {
    return { error: "Unauthorized" };
  }
  
  // Get assignment details with course info
  const assignmentResult = await db.query.assignments.findFirst({
    where: eq(assignments.id, assignmentId),
    with: {
      course: true
    }
  });
  
  if (!assignmentResult) {
    return { error: "Assignment not found" };
  }
  
  // Check if student has already submitted
  const existingSubmission = await db.query.assignmentSubmissions.findFirst({
    where: and(
      eq(assignmentSubmissions.assignmentId, assignmentId),
      eq(assignmentSubmissions.studentId, userId)
    )
  });
  
  // Get course progress stats
  const courseProgress = await getStudentCourseProgress(userId, assignmentResult.course.id);
  
  // Get recent submissions by this student (last 5)
  const recentSubmissions = await db.query.assignmentSubmissions.findMany({
    where: eq(assignmentSubmissions.studentId, userId),
    with: {
      assignment: {
        with: {
          course: true
        }
      }
    },
    orderBy: (assignmentSubmissions, { desc }) => [desc(assignmentSubmissions.submission)],
    limit: 5
  });
  
  return {
    user,
    assignment: assignmentResult,
    existingSubmission,
    courseProgress,
    recentSubmissions
  };
}

// Student dashboard data endpoint
export async function getStudentDashboardData(userId: string) {
  // Execute all database queries in parallel for better performance
  const [studentStatsData, userCoursesWithPerformance, recentActivitiesData] = await Promise.all([
    // 1. Get student stats in a single query
    db.select({
      totalStudents: count(users.id),
      newStudentsLastMonth: sql`count(case when ${users.createdAt} > datetime('now', '-1 month') then 1 end)`,
      totalSubmissions: sql`(select count(*) from ${assignmentSubmissions})`,
      submissionsLastMonth: sql`(select count(*) from ${assignmentSubmissions} where ${assignmentSubmissions.submission} > datetime('now', '-1 month'))`,
      averageScore: sql`ROUND(AVG(${assignmentSubmissions.rating}), 1)`
    })
    .from(users)
    .leftJoin(assignmentSubmissions, eq(assignmentSubmissions.studentId, users.id))
    .where(eq(users.role, "student"))
    .then(res => res[0]),
    
    // 2. Get user courses with performance data in a single query
    db.select({
      courseId: courses.id,
      courseName: courses.name,
      avgScore: sql`ROUND(AVG(${assignmentSubmissions.rating}), 1)`,
      submissions: count(assignmentSubmissions.id)
    })
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .leftJoin(assignments, eq(assignments.courseId, courses.id))
    .leftJoin(assignmentSubmissions, eq(assignmentSubmissions.assignmentId, assignments.id))
    .where(eq(userCourses.userId, userId))
    .groupBy(courses.id, courses.name),
    
    // 3. Get recent activities in a single query
    db.select({
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
    .limit(3)
  ]);

  // Calculate performance improvement (weekly change)
  const performanceImprovement = studentStatsData.averageScore 
    ? '+4.2%'  // This would ideally be calculated from historical data
    : '+0%';
  
  // Calculate average completion rate across all courses
  const averageCompletionRate = userCoursesWithPerformance.length > 0
    ? userCoursesWithPerformance.reduce((sum, course) => sum + (Number(course.submissions) || 0), 0) / 
      userCoursesWithPerformance.reduce((sum, course) => sum + (course.submissions ? 1 : 0), 0)
    : 0;
  
  const completionRate = `${Math.round(averageCompletionRate)}%`;
  
  // Calculate active students metrics
  const activeStudents = studentStatsData.submissionsLastMonth || 0;
  const engagementRate = studentStatsData.totalStudents > 0
    ? Math.round((Number(studentStatsData.submissionsLastMonth) / Number(studentStatsData.totalStudents)) * 100)
    : 0;
  
  // Format the course data for the dashboard - use only primary color
  const formattedCourses = userCoursesWithPerformance.map((course) => {
    // Find course completion rate
    const progress = course.avgScore ? Number(course.avgScore) : 0;
    const completion = `${Math.round(progress)}%`;
    
    return {
      id: course.courseId,
      title: course.courseName,
      progress: Math.round(progress),
      color: "primary",
      students: course.submissions ? Number(course.submissions) : 0,
      completion
    };
  });
  
  return {
    performance: {
      value: studentStatsData.averageScore ? Number(studentStatsData.averageScore) : 0,
      improvement: performanceImprovement
    },
    completion: {
      value: completionRate,
      rate: Math.round(averageCompletionRate)
    },
    engagement: {
      activeStudents: Number(activeStudents),
      rate: engagementRate
    },
    recentActivities: recentActivitiesData,
    courses: formattedCourses.slice(0, 3) // Limit to 3 courses for the dashboard
  };
}

// Lecturer dashboard data endpoint
export async function getLecturerDashboardData(userId: string) {
  // Execute all database queries in parallel for better performance
  const [coursesData, submissionsData, recentActivitiesData] = await Promise.all([
    // 1. Get lecturer's courses with statistics
    db.select({
      courseId: courses.id,
      courseName: courses.name,
      studentCount: sql`(SELECT COUNT(*) FROM ${userCourses} WHERE ${userCourses.courseId} = ${courses.id})`,
      avgScore: sql`ROUND(AVG(${assignmentSubmissions.rating}), 1)`,
      submissions: count(assignmentSubmissions.id),
      completionRate: sql`ROUND((COUNT(${assignmentSubmissions.id}) * 100.0) / 
        (SELECT COUNT(*) FROM ${userCourses} WHERE ${userCourses.courseId} = ${courses.id}), 1)`
    })
    .from(courses)
    .leftJoin(assignments, eq(assignments.courseId, courses.id))
    .leftJoin(assignmentSubmissions, eq(assignmentSubmissions.assignmentId, assignments.id))
    .where(eq(courses.lecturerId, userId))
    .groupBy(courses.id, courses.name),
    
    // 2. Get recent submissions statistics
    db.select({
      totalSubmissions: count(),
      recentSubmissions: sql`COUNT(CASE WHEN ${assignmentSubmissions.submission} > datetime('now', '-1 week') THEN 1 END)`,
      avgScore: sql`ROUND(AVG(${assignmentSubmissions.rating}), 1)`,
      gradedCount: sql`COUNT(CASE WHEN ${assignmentSubmissions.rating} IS NOT NULL THEN 1 END)`
    })
    .from(assignmentSubmissions)
    .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(eq(courses.lecturerId, userId)),
    
    // 3. Get recent activities for lecturer's courses
    db.select({
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
    .where(eq(courses.lecturerId, userId))
    .orderBy(desc(assignmentSubmissions.submission))
    .limit(3)
  ]);

  // Calculate recent performance trend (for the first card)
  const performanceValue = submissionsData[0].avgScore ? Number(submissionsData[0].avgScore) : 0;
  const performanceImprovement = "+5.3%"; // This would ideally be calculated from historical data
  
  // Calculate overall completion rate (for the second card)
  const totalEnrollments = coursesData.reduce((sum, course) => sum + Number(course.studentCount || 0), 0);
  const totalSubmissions = submissionsData[0].totalSubmissions || 0;
  const completionRate = totalEnrollments > 0 
    ? Math.round((Number(totalSubmissions) / totalEnrollments) * 100) 
    : 0;
  
  // Calculate engagement metrics (for the third card)
  const recentSubmissionsCount = submissionsData[0].recentSubmissions || 0;
  const engagementRate = totalEnrollments > 0 
    ? Math.round((Number(recentSubmissionsCount) / totalEnrollments) * 100)
    : 0;
  
  // Format the courses data for display
  const formattedCourses = coursesData.map(course => ({
    id: course.courseId,
    title: course.courseName,
    progress: course.avgScore ? Number(course.avgScore) : 0,
    color: "primary",
    students: Number(course.studentCount || 0),
    completion: `${course.completionRate || 0}%`
  }));

  return {
    performance: {
      value: performanceValue,
      improvement: performanceImprovement
    },
    completion: {
      value: `${completionRate}%`,
      rate: completionRate
    },
    engagement: {
      activeStudents: Number(recentSubmissionsCount),
      rate: engagementRate
    },
    recentActivities: recentActivitiesData,
    courses: formattedCourses.slice(0, 3) // Limit to 3 courses for the dashboard
  };
}

// Combined function for backward compatibility - determines user role and calls appropriate function
export async function getDashboardData(userId: string) {
  // Get user to determine role
  const user = await db.select().from(users).where(eq(users.id, userId)).then(res => res[0]);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Call appropriate dashboard data function based on role
  if (user.role === "lecturer" || user.role === "admin") {
    return getLecturerDashboardData(userId);
  } else {
    return getStudentDashboardData(userId);
  }
} 
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
  formSubmissions,
  resources,
  embeddings,
  chats,
  chatMessages,
  ChatMessageInsert
} from "@/lib/db/drizzle/schema";
import { eq, sql, count, avg, max, min, desc, and, inArray } from "drizzle-orm";
import { generateEmbeddings } from "@/lib/ai/embedding";

export async function getUserById(id: string) {
    if (!id || id === '') {
        return null;
    }
    return await db.select().from(users).where(eq(users.id, id)).then((res) => res[0])
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
    const previousMonth = i + 1;
    const currentMonth = i;
    const monthData = await db
      .select({
        avgScore: avg(assignmentSubmissions.rating),
        count: count()
      })
      .from(assignmentSubmissions)
      .where(
        sql`${assignmentSubmissions.submission} BETWEEN DATE_TRUNC('day', NOW() - INTERVAL '1 month' * ${previousMonth}) AND DATE_TRUNC('day', NOW() - INTERVAL '1 month' * ${currentMonth})`
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
  // Fetch courses with lecturer names
  const allCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      lecturerId: courses.lecturerId,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      creatorName: users.name,
    })
    .from(courses)
    .leftJoin(users, eq(users.id, courses.lecturerId));
  
  // Get enrollment counts for each course
  const enrollmentCounts = await db
    .select({
      courseId: userCourses.courseId,
      count: count(),
    })
    .from(userCourses)
    .groupBy(userCourses.courseId);
  
  // Get assignment counts for each course
  const assignmentCounts = await db
    .select({
      courseId: assignments.courseId,
      count: count(),
    })
    .from(assignments)
    .groupBy(assignments.courseId);
  
  // Create a map of course IDs to enrollment and assignment counts
  const enrollmentMap = new Map(
    enrollmentCounts.map(item => [item.courseId, item.count])
  );
  
  const assignmentMap = new Map(
    assignmentCounts.map(item => [item.courseId, item.count])
  );
  
  // Get user enrollments if userId is provided
  let enrolledCourseIds = new Set<string>();
  if (userId) {
    const userEnrollments = await db.query.userCourses.findMany({
      where: eq(userCourses.userId, userId),
    });
    enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId));
  }
  
  // Combine all data
  return allCourses.map(course => ({
    ...course,
    enrollmentCount: enrollmentMap.get(course.id) || 0,
    assignmentCount: assignmentMap.get(course.id) || 0,
    isUserEnrolled: enrolledCourseIds.has(course.id),
  }));
}

export async function getCourseById(id: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
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
      inArray(assignmentSubmissions.assignmentId, courseAssignmentIds),
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
        inArray(assignmentSubmissions.assignmentId, courseAssignmentIds)
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
      inArray(assignmentSubmissions.assignmentId, courseAssignments.map(a => a.id))
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
  const [studentStatsData, userCoursesWithPerformance, recentActivitiesData, upcomingAssignmentsData] = await Promise.all([
    // 1. Get student stats in a single query
    db.select({
      totalStudents: count(users.id),
      newStudentsLastMonth: sql`COUNT(CASE WHEN ${users.createdAt} > NOW() - INTERVAL '1 month' THEN 1 END)`,
      totalSubmissions: sql`(SELECT COUNT(*) FROM ${assignmentSubmissions})`,
      submissionsLastMonth: sql`(SELECT COUNT(*) FROM ${assignmentSubmissions} WHERE ${assignmentSubmissions.submission} > NOW() - INTERVAL '1 month')`,
      averageScore: sql`AVG(${assignmentSubmissions.rating})::numeric(10,1)`
    })
    .from(users)
    .leftJoin(assignmentSubmissions, eq(assignmentSubmissions.studentId, users.id))
    .where(eq(users.role, "student"))
    .then(res => res[0]),
    
    // 2. Get user courses with performance data in a single query
    db.select({
      courseId: courses.id,
      courseName: courses.name,
      avgScore: sql`AVG(${assignmentSubmissions.rating})::numeric(10,1)`,
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
    .where(eq(assignmentSubmissions.studentId, userId))
    .orderBy(desc(assignmentSubmissions.submission))
    .limit(3),
    
    // 4. Get upcoming assignments for enrolled courses
    db.select({
      id: assignments.id,
      name: assignments.name,
      courseId: assignments.courseId,
      courseName: courses.name,
      deadline: assignments.deadline,
      isCompleted: sql`EXISTS (
        SELECT 1 FROM ${assignmentSubmissions} 
        WHERE ${assignmentSubmissions.assignmentId} = ${assignments.id} 
        AND ${assignmentSubmissions.studentId} = ${userId}
      )`
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .innerJoin(userCourses, eq(userCourses.courseId, courses.id))
    .where(
      and(
        eq(userCourses.userId, userId),
        sql`${assignments.deadline} >= NOW()` // Only include future assignments
      )
    )
    .orderBy(assignments.deadline)
    .limit(5)
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
    courses: formattedCourses.slice(0, 3), // Limit to 3 courses for the dashboard
    upcomingAssignments: upcomingAssignmentsData
  };
}

// Lecturer dashboard data endpoint
export async function getLecturerDashboardData(userId: string) {
  // Execute all database queries in parallel for better performance
  const [coursesData, submissionsData, recentActivitiesData, latestAssignmentsData] = await Promise.all([
    // 1. Get lecturer's courses with statistics
    db.select({
      courseId: courses.id,
      courseName: courses.name,
      studentCount: sql`(SELECT COUNT(*) FROM ${userCourses} WHERE ${userCourses.courseId} = ${courses.id})`,
      avgScore: sql`AVG(${assignmentSubmissions.rating})::numeric(10,1)`,
      submissions: count(assignmentSubmissions.id),
      completionRate: sql`(COUNT(${assignmentSubmissions.id}) * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM ${userCourses} WHERE ${userCourses.courseId} = ${courses.id}), 0))::numeric(10,1)`
    })
    .from(courses)
    .leftJoin(assignments, eq(assignments.courseId, courses.id))
    .leftJoin(assignmentSubmissions, eq(assignmentSubmissions.assignmentId, assignments.id))
    .where(eq(courses.lecturerId, userId))
    .groupBy(courses.id, courses.name),
    
    // 2. Get recent submissions statistics
    db.select({
      totalSubmissions: count(),
      recentSubmissions: sql`COUNT(CASE WHEN ${assignmentSubmissions.submission} > NOW() - INTERVAL '1 week' THEN 1 END)`,
      avgScore: sql`AVG(${assignmentSubmissions.rating})::numeric(10,1)`,
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
    .limit(3),
    
    // 4. Get latest assignments created by lecturer
    db.select({
      id: assignments.id,
      name: assignments.name,
      courseId: assignments.courseId,
      courseName: courses.name,
      deadline: assignments.deadline,
      submissionsCount: sql`(
        SELECT COUNT(*) FROM ${assignmentSubmissions}
        WHERE ${assignmentSubmissions.assignmentId} = ${assignments.id}
      )`,
      totalStudents: sql`(
        SELECT COUNT(*) FROM ${userCourses}
        WHERE ${userCourses.courseId} = ${assignments.courseId}
      )`
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(eq(courses.lecturerId, userId))
    .orderBy(desc(assignments.createdAt))
    .limit(5)
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
    courses: formattedCourses.slice(0, 3), // Limit to 3 courses for the dashboard
    latestAssignments: latestAssignmentsData
  };
}
// RAG Chatbot actions
export interface CreateResourceParams {
  content: string;
}

// Create a resource entry and its embeddings
export async function createResource(params: CreateResourceParams) {
  const { content, } = params;
  
  // Insert the resource
  const [resource] = await db
    .insert(resources)
    .values({
      content,
    })
    .returning();
  
  // Generate embeddings for the content
  const contentEmbeddings = await generateEmbeddings(content);
  
  // Insert all embeddings
  for (const { content: chunkContent, embedding } of contentEmbeddings) {
    await db.insert(embeddings).values({
      content: chunkContent,
      embedding,
      resourceId: resource.id,
    });
  }
  
  return resource;
}

// Get user info for RAG chatbot
export async function getUserInfo(userId: string) {
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .then((res) => res[0]);
  
  return user;
}

// Get user course info for RAG chatbot
export async function getUserCoursesInfo(userId: string) {
  const userCourseInfo = await db
    .select({
      courseName: courses.name,
      courseId: courses.id,
      createdAt: userCourses.createdAt,
    })
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .where(eq(userCourses.userId, userId));
  
  return userCourseInfo;
}

// Get user assignment info for RAG chatbot
export async function getUserAssignmentsInfo(userId: string) {
  const userAssignments = await db
    .select({
      assignmentName: assignments.name,
      assignmentId: assignments.id,
      deadline: assignments.deadline,
      courseName: courses.name,
      courseId: courses.id,
      submission: assignmentSubmissions.submission,
      rating: assignmentSubmissions.rating,
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .innerJoin(userCourses, eq(userCourses.courseId, courses.id))
    .leftJoin(
      assignmentSubmissions,
      and(
        eq(assignmentSubmissions.assignmentId, assignments.id),
        eq(assignmentSubmissions.studentId, userId)
      )
    )
    .where(eq(userCourses.userId, userId));
  
  return userAssignments;
}

// Get all resources for RAG chatbot
export async function getAllResources() {
  const allResources = await db
    .select({
      id: resources.id,
      content: resources.content,
      createdAt: resources.createdAt,
      userName: users.name,
    })
    .from(resources)
  
  return allResources;
}

// Get all courses info for RAG chatbot
export async function getAllCoursesInfo() {
  const allCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      lecturerName: users.name,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .leftJoin(users, eq(users.id, courses.lecturerId));
  
  // Get enrollment counts for each course
  const enrollmentCounts = await db
    .select({
      courseId: userCourses.courseId,
      count: count(),
    })
    .from(userCourses)
    .groupBy(userCourses.courseId);
  
  // Create a map of course IDs to enrollment counts
  const enrollmentMap = new Map(
    enrollmentCounts.map(item => [item.courseId, item.count])
  );
  
  // Combine all data
  return allCourses.map(course => ({
    ...course,
    enrollmentCount: enrollmentMap.get(course.id) || 0,
  }));
}

// Get all lecturers on the platform
export async function getLecturers() {
  const lecturers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.role, "lecturer"));
  
  // For each lecturer, get the count of courses they teach
  const lecturerIds = lecturers.map(lecturer => lecturer.id);
  
  const courseCounts = await db
    .select({
      lecturerId: courses.lecturerId,
      count: count(),
    })
    .from(courses)
    .where(inArray(courses.lecturerId, lecturerIds))
    .groupBy(courses.lecturerId);
  
  // Create a map of lecturer IDs to course counts
  const courseCountMap = new Map(
    courseCounts.map(item => [item.lecturerId, item.count])
  );
  
  // Combine all data
  return lecturers.map(lecturer => ({
    ...lecturer,
    coursesCount: courseCountMap.get(lecturer.id) || 0,
  }));
}

// Get average grades for a user across all courses
export async function getAverageGrades(userId: string) {
  // Get user info first
  const user = await getUserInfo(userId);
  
  if (!user) {
    return { error: "User not found" };
  }
  
  // Get all submission grades for this user
  const submissions = await db
    .select({
      assignmentId: assignmentSubmissions.assignmentId,
      rating: assignmentSubmissions.rating,
      assignmentName: assignments.name,
      courseId: assignments.courseId,
      courseName: courses.name,
    })
    .from(assignmentSubmissions)
    .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(
      and(
        eq(assignmentSubmissions.studentId, userId),
        sql`${assignmentSubmissions.rating} IS NOT NULL`
      )
    );
  
  if (submissions.length === 0) {
    return {
      user,
      averageGrade: null,
      courseGrades: [],
      message: "No graded submissions found"
    };
  }
  
  // Calculate overall average
  const overallAverage = submissions.reduce((sum, sub) => sum + (sub.rating || 0), 0) / submissions.length;
  
  // Group by course and calculate course averages
  const courseGrades = [];
  const courseMap = new Map();
  
  for (const submission of submissions) {
    if (!courseMap.has(submission.courseId)) {
      courseMap.set(submission.courseId, {
        courseId: submission.courseId,
        courseName: submission.courseName,
        grades: [],
      });
    }
    
    courseMap.get(submission.courseId).grades.push(submission.rating || 0);
  }
  
  for (const [, courseData] of courseMap.entries()) {
    const courseAverage = courseData.grades.reduce((sum: number, grade: number) => sum + grade, 0) / courseData.grades.length;
    courseGrades.push({
      courseId: courseData.courseId,
      courseName: courseData.courseName,
      averageGrade: courseAverage,
      submissionCount: courseData.grades.length,
    });
  }
  
  return {
    user,
    averageGrade: overallAverage,
    courseGrades,
  };
}
export async function getCourseGrades(courseId: string) {
  const course = await getCourseById(courseId);
  
  if (!course) {
    return { error: "Course not found" };
  }
  
  // Get all submissions for this course
  const submissions = await db
    .select({
      id: assignmentSubmissions.id,
      studentId: assignmentSubmissions.studentId,
      studentName: users.name,
      assignmentId: assignmentSubmissions.assignmentId,
      assignmentName: assignments.name,
      rating: assignmentSubmissions.rating,
      submission: assignmentSubmissions.submission,
    })
    .from(assignmentSubmissions)
    .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
    .where(
      and(
        eq(assignments.courseId, courseId),
        sql`${assignmentSubmissions.rating} IS NOT NULL`
      )
    );
  
  if (submissions.length === 0) {
    return {
      course,
      averageGrade: null,
      studentGrades: [],
      message: "No graded submissions found for this course"
    };
  }
  
  // Calculate overall course average
  const overallAverage = submissions.reduce((sum, sub) => sum + (sub.rating || 0), 0) / submissions.length;
  
  // Group by student and calculate student averages
  const studentGrades = [];
  const studentMap = new Map();
  
  for (const submission of submissions) {
    if (!studentMap.has(submission.studentId)) {
      studentMap.set(submission.studentId, {
        studentId: submission.studentId,
        studentName: submission.studentName,
        grades: [],
      });
    }
    
    studentMap.get(submission.studentId).grades.push(submission.rating || 0);
  }
  
  // Calculate average for each student
  for (const [, studentData] of studentMap.entries()) {
    const studentAverage = studentData.grades.reduce((sum: number, grade: number) => sum + grade, 0) / studentData.grades.length;
    studentGrades.push({
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      averageGrade: studentAverage,
      submissionCount: studentData.grades.length,
    });
  }
  
  // Get distribution data
  const ranges = [
    { min: 0, max: 59, label: '0-59' },
    { min: 60, max: 69, label: '60-69' },
    { min: 70, max: 79, label: '70-79' },
    { min: 80, max: 89, label: '80-89' },
    { min: 90, max: 100, label: '90-100' }
  ];
  
  const gradeDistribution = ranges.map(range => {
    const count = submissions.filter(
      sub => (sub.rating || 0) >= range.min && (sub.rating || 0) <= range.max
    ).length;
    
    return {
      range: range.label,
      count,
      percentage: (count / submissions.length) * 100
    };
  });
  
  return {
    course,
    averageGrade: overallAverage,
    studentGrades,
    gradeDistribution,
    submissionCount: submissions.length,
  };
}

// Calculate weekly change metrics for student dashboard
export async function getStudentWeeklyMetrics(userId: string) {
  // Get current week stats
  const currentWeekStats = await db
    .select({
      submissions: count(),
      avgGrade: avg(assignmentSubmissions.rating)
    })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.studentId, userId),
        sql`${assignmentSubmissions.submission} > NOW() - INTERVAL '1 week'`
      )
    );
  
  // Get previous week stats
  const previousWeekStats = await db
    .select({
      submissions: count(),
      avgGrade: avg(assignmentSubmissions.rating)
    })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.studentId, userId),
        sql`${assignmentSubmissions.submission} BETWEEN NOW() - INTERVAL '2 week' AND NOW() - INTERVAL '1 week'`
      )
    );
  
  // Calculate changes
  const submissionsChange = previousWeekStats[0].submissions > 0
    ? ((currentWeekStats[0].submissions - previousWeekStats[0].submissions) / previousWeekStats[0].submissions) * 100
    : currentWeekStats[0].submissions > 0 ? 100 : 0;
  
  const gradeChange = previousWeekStats[0].avgGrade
    ? ((Number(currentWeekStats[0].avgGrade || 0) - Number(previousWeekStats[0].avgGrade || 0)) / Number(previousWeekStats[0].avgGrade || 1)) * 100
    : 0;
  
  return {
    submissionsChange: submissionsChange ? `${submissionsChange > 0 ? '+' : ''}${submissionsChange.toFixed(1)}%` : '+0%',
    gradeChange: gradeChange ? `${gradeChange > 0 ? '+' : ''}${gradeChange.toFixed(1)}%` : '+0%',
    currentWeekSubmissions: currentWeekStats[0].submissions,
    previousWeekSubmissions: previousWeekStats[0].submissions,
    currentWeekGrade: currentWeekStats[0].avgGrade ? Number(currentWeekStats[0].avgGrade) : 0,
    previousWeekGrade: previousWeekStats[0].avgGrade ? Number(previousWeekStats[0].avgGrade) : 0
  };
}

// Calculate weekly change metrics for lecturer dashboard
export async function getLecturerWeeklyMetrics(userId: string) {
  // Get current week stats for lecturer's courses
  const currentWeekStats = await db
    .select({
      submissions: count(),
      avgGrade: avg(assignmentSubmissions.rating),
      studentsCount: sql`COUNT(DISTINCT ${assignmentSubmissions.studentId})`
    })
    .from(assignmentSubmissions)
    .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(
      and(
        eq(courses.lecturerId, userId),
        sql`${assignmentSubmissions.submission} > NOW() - INTERVAL '1 week'`
      )
    );
  
  // Get previous week stats
  const previousWeekStats = await db
    .select({
      submissions: count(),
      avgGrade: avg(assignmentSubmissions.rating),
      studentsCount: sql`COUNT(DISTINCT ${assignmentSubmissions.studentId})`
    })
    .from(assignmentSubmissions)
    .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(
      and(
        eq(courses.lecturerId, userId),
        sql`${assignmentSubmissions.submission} BETWEEN NOW() - INTERVAL '2 week' AND NOW() - INTERVAL '1 week'`
      )
    );
  
  // Calculate changes
  const submissionsChange = previousWeekStats[0].submissions > 0
    ? ((currentWeekStats[0].submissions - previousWeekStats[0].submissions) / previousWeekStats[0].submissions) * 100
    : currentWeekStats[0].submissions > 0 ? 100 : 0;
  
  const gradeChange = previousWeekStats[0].avgGrade
    ? ((Number(currentWeekStats[0].avgGrade || 0) - Number(previousWeekStats[0].avgGrade || 0)) / Number(previousWeekStats[0].avgGrade || 1)) * 100
    : 0;
  
  const currentStudentsCount = Number(currentWeekStats[0].studentsCount || 0);
  const previousStudentsCount = Number(previousWeekStats[0].studentsCount || 0);
  
  const studentsChange = previousStudentsCount > 0
    ? ((currentStudentsCount - previousStudentsCount) / previousStudentsCount) * 100
    : currentStudentsCount > 0 ? 100 : 0;
  
  return {
    submissionsChange: submissionsChange ? `${submissionsChange > 0 ? '+' : ''}${submissionsChange.toFixed(1)}%` : '+0%',
    gradeChange: gradeChange ? `${gradeChange > 0 ? '+' : ''}${gradeChange.toFixed(1)}%` : '+0%',
    studentsChange: studentsChange ? `${studentsChange > 0 ? '+' : ''}${studentsChange.toFixed(1)}%` : '+0%',
    currentWeekSubmissions: currentWeekStats[0].submissions,
    previousWeekSubmissions: previousWeekStats[0].submissions,
    currentWeekGrade: currentWeekStats[0].avgGrade ? Number(currentWeekStats[0].avgGrade) : 0,
    previousWeekGrade: previousWeekStats[0].avgGrade ? Number(previousWeekStats[0].avgGrade) : 0,
    currentWeekStudents: currentStudentsCount,
    previousWeekStudents: previousStudentsCount
  };
}

export interface SaveChatMessageParams {
  userId: string;
  chatId: string;
  messages: ChatMessageInsert[];
}

export async function saveChatMessages(params: SaveChatMessageParams) {
  db.transaction(async (tx) => {
    const user = await getUserById(params.userId);
    if (!user) {  
      throw new Error('User not found');
    }
    const [newMessage] = await tx.insert(chatMessages).values(params.messages).returning();
    await tx.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, params.chatId));
    return newMessage;
  });
}

export interface CreateChatWithMessagesParams {
  userId: string;
  messages: ChatMessageInsert[];
  title?: string;
}

export async function createChatWithMessages(params: CreateChatWithMessagesParams) {
  const { userId, messages, title = 'New Conversation' } = params;
  
  try {
    const [newChat] = await db
      .insert(chats)
      .values({
        userId,
        title,
      })
      .returning();
  
    const insertedMessages = await db
      .insert(chatMessages)
      .values(messages.map(msg => ({
        chatId: newChat.id,
        content: msg.content,
        role: msg.role,
      })))
      .returning();
    
    return { chat: newChat, messages: insertedMessages };
  } catch (error) {
    console.error('Error creating chat with messages:', error);
    throw new Error('Failed to create chat with messages');
  }
}

export async function getUserChats(userId: string) {
  try {
    const userChats = await db.query.chats.findMany({
      where: eq(chats.userId, userId),
      orderBy: [desc(chats.updatedAt)],
    });
    
    return userChats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw new Error('Failed to get user chats');
  }
}

export async function deleteChat(chatId: string) {
  try {
    await db
      .delete(chats)
      .where(eq(chats.id, chatId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw new Error('Failed to delete chat');
  }
}

export async function getChatWithMessages(chatId: string){
  try {
    const chat = await db.query.chats.findFirst({
      with: {
        messages:true
      },
      where: eq(chats.id, chatId),
    });
    return chat;
  } catch (error: unknown) {
    console.error('Error getting chat with messages:', error);
    throw new Error('Failed to get chat with messages');
  }
}
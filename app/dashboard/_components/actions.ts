"use server";

import { db } from "@/lib/db";
import { 
  users, 
  courses, 
  assignments, 
  assignmentSubmissions,
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
  // Count total students
  const totalStudentsResult = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "student"));
  
  const totalStudents = totalStudentsResult[0].count || 0;

  // Get assignment data with completion stats
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
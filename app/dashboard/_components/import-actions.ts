"use server";

import { db } from "@/lib/db";
import { 
  users, 
  courses as coursesTable, 
  assignments as assignmentsTable, 
  assignmentSubmissions,
} from "@/drizzle/schema";
import { revalidatePath } from "next/cache";

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

// Import students from CSV or other data sources
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

// Import courses
export async function importCourses(importedCourses: ImportedCourse[]) {
  try {
    const inserts = [];
    
    for (const course of importedCourses) {
      const insert = db.insert(coursesTable).values({
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

// Import assignments
export async function importAssignments(importedAssignments: ImportedAssignment[]) {
  try {
    const inserts = [];
    
    for (const assignment of importedAssignments) {
      const insert = db.insert(assignmentsTable).values({
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

// Import assignment submissions
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

// Process CSV data for students
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
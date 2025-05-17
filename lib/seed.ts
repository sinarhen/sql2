import { db } from './db';
import { users, courses, userCourses, assignments, assignmentSubmissions, forms as formTable, formSubmissions as formSubmissionTable, resources, embeddings } from '../lib/db/drizzle/schema';
import bcrypt from 'bcrypt';
import { generateEmbeddings } from './ai/embedding';

export async function createResource(content: string) {
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

export async function seed() {
  console.log('🌱 Seeding database...');
  
  // Clear database first
  try {
    await db.delete(embeddings);
    await db.delete(resources);
    await db.delete(formSubmissionTable);
    await db.delete(formTable);
    await db.delete(assignmentSubmissions);
    await db.delete(assignments);
    await db.delete(userCourses);
    await db.delete(courses);
    await db.delete(users);
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
  
  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await db.insert(users).values({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash,
    role: 'admin',
  }).returning();
  
  // Create lecturers
  const [lecturer1] = await db.insert(users).values({
    name: 'John Smith',
    email: 'lecturer1@example.com',
    passwordHash,
    role: 'lecturer',
  }).returning();
  
  const [lecturer2] = await db.insert(users).values({
    name: 'Emily Johnson',
    email: 'lecturer2@example.com',
    passwordHash,
    role: 'lecturer',
  }).returning();
  
  const [lecturer3] = await db.insert(users).values({
    name: 'Michael Brown',
    email: 'lecturer3@example.com',
    passwordHash,
    role: 'lecturer',
  }).returning();
  
  // Create students
  const students = [];
  const studentNames = [
    'Alice Walker', 'Bob Chen', 'Charlie Davis', 'Diana Kim', 
    'Elijah Martinez', 'Fatima Ali', 'George Wilson', 'Hannah Singh', 
    'Isaac Taylor', 'Julia Garcia', 'Kevin Lee', 'Layla Patel', 
    'Mason Jackson', 'Nora Robinson', 'Oliver Wong', 'Priya Sharma', 
    'Quinn Thomas', 'Rachel Nguyen', 'Samuel Lopez', 'Tara Williams'
  ];
  
  for (let i = 0; i < studentNames.length; i++) {
    const [student] = await db.insert(users).values({
      name: studentNames[i],
      email: `student${i+1}@example.com`,
      passwordHash,
      role: 'student',
    }).returning();
    
    students.push(student);
  }
  
  console.log('✅ Users created');
  
  // Create courses
  const [course1] = await db.insert(courses).values({
    name: 'Introduction to Computer Science',
    lecturerId: lecturer1.id
  }).returning();
  
  const [course2] = await db.insert(courses).values({
    name: 'Web Development Fundamentals',
    lecturerId: lecturer1.id
  }).returning();
  
  const [course3] = await db.insert(courses).values({
    name: 'Data Structures and Algorithms',
    lecturerId: lecturer2.id
  }).returning();
  
  const [course4] = await db.insert(courses).values({
    name: 'Database Systems',
    lecturerId: lecturer2.id
  }).returning();
  
  const [course5] = await db.insert(courses).values({
    name: 'Artificial Intelligence',
    lecturerId: lecturer3.id
  }).returning();
  
  const [course6] = await db.insert(courses).values({
    name: 'Mobile App Development',
    lecturerId: lecturer3.id
  }).returning();
  
  console.log('✅ Courses created');
  
  // Create user-course relationships
  const allCourses = [course1, course2, course3, course4, course5, course6];
  const enrollments = [];
  
  // Enroll lecturers in their own courses
  enrollments.push({ userId: lecturer1.id, courseId: course1.id });
  enrollments.push({ userId: lecturer1.id, courseId: course2.id });
  enrollments.push({ userId: lecturer2.id, courseId: course3.id });
  enrollments.push({ userId: lecturer2.id, courseId: course4.id });
  enrollments.push({ userId: lecturer3.id, courseId: course5.id });
  enrollments.push({ userId: lecturer3.id, courseId: course6.id });
  
  // Randomly enroll students in courses
  for (const student of students) {
    // Each student enrolls in 2-4 random courses
    const numCourses = 2 + Math.floor(Math.random() * 3);
    const shuffledCourses = [...allCourses].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numCourses && i < shuffledCourses.length; i++) {
      enrollments.push({
        userId: student.id,
        courseId: shuffledCourses[i].id
      });
    }
  }
  
  // Insert all enrollments
  await db.insert(userCourses).values(enrollments);
  
  console.log('✅ Course enrollments created');
  
  // Create assignments for each course
  const courseAssignments = [];
  
  // Helper function to create dates in the past or future
  const createDate = (daysOffset: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
  };
  
  // Create assignments for each course with deadlines spanning past 6 months to future
  for (const course of allCourses) {
    // Past assignments
    for (let i = 1; i <= 5; i++) {
      courseAssignments.push({
        name: `${course.name} - Week ${i} Assignment`,
        courseId: course.id,
        deadline: createDate(-180 + i * 14), // Spaced roughly every 2 weeks
      });
    }
    
    // Current assignments
    courseAssignments.push({
      name: `${course.name} - Midterm Project`,
      courseId: course.id,
      deadline: createDate(7), // Due next week
    });
    
    // Future assignments
    for (let i = 1; i <= 3; i++) {
      courseAssignments.push({
        name: `${course.name} - Advanced Topic ${i}`,
        courseId: course.id,
        deadline: createDate(14 + i * 14), // Future assignments
      });
    }
    
    // Final project
    courseAssignments.push({
      name: `${course.name} - Final Project`,
      courseId: course.id,
      deadline: createDate(90), // Due in 3 months
    });
  }
  
  // Insert all assignments
  const createdAssignments = [];
  for (const assignment of courseAssignments) {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    createdAssignments.push(newAssignment);
  }
  
  console.log('✅ Assignments created');
  
  // Create assignment submissions with varied grades
  const submissions = [];
  
  // Helper function to generate a realistic grade with some variability
  const generateGrade = (baseScore: number, studentQuality: number): number => {
    // Base score for the assignment (difficulty factor)
    // Student quality (0-1 scale)
    // Add some randomness
    const randomFactor = Math.random() * 20 - 10; // -10 to +10
    let grade = baseScore + (studentQuality * 20) + randomFactor;
    
    // Ensure grade is within bounds
    grade = Math.min(100, Math.max(40, grade));
    return Math.round(grade);
  };
  
  // Assign a "quality" score to each student for consistency in their grades
  const studentQualities: Record<string, number> = {};
  students.forEach(student => {
    studentQualities[student.id] = Math.random(); // 0-1 scale
  });
  
  // For each enrollment, get the student's enrolled courses
  for (const enrollment of enrollments) {
    if (enrollment.userId === lecturer1.id || enrollment.userId === lecturer2.id || enrollment.userId === lecturer3.id) {
      continue; // Skip lecturers
    }
    
    // Get assignments for this course
    const courseAssignments = createdAssignments.filter(a => a.courseId === enrollment.courseId);
    
    // Student submits most past assignments
    for (const assignment of courseAssignments) {
      // Only submit assignments that are due in the past
      if (assignment.deadline < new Date()) {
        // 85% chance of submission for past assignments
        if (Math.random() < 0.85) {
          const daysPastDeadline = (new Date().getTime() - assignment.deadline.getTime()) / (1000 * 3600 * 24);
          
          // Submissions closer to deadline for more recent assignments
          const submissionDate = new Date(assignment.deadline);
          submissionDate.setDate(
            submissionDate.getDate() - Math.floor(Math.random() * Math.min(5, daysPastDeadline))
          );
          
          const studentQuality = studentQualities[enrollment.userId];
          const baseScore = 65 + (Math.random() * 10); // Base score varies by assignment difficulty
          
          // Generate grade (some might be null to simulate ungraded assignments)
          const isGraded = Math.random() < 0.9; // 90% of submissions are graded
          const rating = isGraded ? generateGrade(baseScore, studentQuality) : null;
          
          submissions.push({
            assignmentId: assignment.id,
            studentId: enrollment.userId,
            content: `This is my submission for ${assignment.name}. I've completed all the required tasks and followed the guidelines.`,
            submission: submissionDate,
            rating
          });
        }
      } else if (Math.random() < 0.2) {
        // 20% chance to submit early for future assignments
        const submissionDate = new Date();
        
        // Always null rating for future assignments (not graded yet)
        submissions.push({
          assignmentId: assignment.id,
          studentId: enrollment.userId,
          content: `Early submission for ${assignment.name}. I've worked ahead and completed all requirements.`,
          submission: submissionDate,
          rating: null
        });
      }
    }
  }
  
  // Insert all submissions
  for (const submission of submissions) {
    await db.insert(assignmentSubmissions).values(submission);
  }
  
  console.log('✅ Assignment submissions created');
  
  // Create forms for course feedback
  const formsData = [];
  
  // Create end-of-month feedback forms for the past 3 months
  for (let i = 1; i <= 3; i++) {
    const formDate = new Date();
    formDate.setMonth(formDate.getMonth() - i);
    formDate.setDate(28); // End of month approx
    
    formsData.push({
      name: `Course Feedback - ${formDate.toLocaleString('default', { month: 'long' })}`,
      end: formDate
    });
  }
  
  // Create a current feedback form
  const currentFormDate = new Date();
  currentFormDate.setDate(currentFormDate.getDate() + 14); // Due in 2 weeks
  
  formsData.push({
    name: 'Current Course Feedback',
    end: currentFormDate
  });
  
  // Insert forms
  const createdForms = [];
  for (const formData of formsData) {
    const [newForm] = await db.insert(formTable).values(formData).returning();
    createdForms.push(newForm);
  }
  
  console.log('✅ Forms created');
  
  // Create form submissions with varied feedback
  const formSubmissionsData = [];
  
  // Example feedback texts
  const feedbackOptions = [
    "The course has been very informative. I appreciate the hands-on projects.",
    "The lectures are engaging but I would like more practical examples.",
    "This course material is challenging but rewarding. I'm learning a lot.",
    "The instructor explains concepts clearly. Very satisfied with the teaching.",
    "I think the assignments could be more challenging. Otherwise good course.",
    "The pace of the course is good. I can follow along without feeling rushed.",
    "I struggled with some concepts but the additional resources helped.",
    "Very well structured course. The progression of topics makes sense.",
    "The feedback on assignments has been very helpful for improvement.",
    "I appreciate the real-world applications shown in this course."
  ];
  
  // For past forms, add submissions from various students
  for (let i = 0; i < createdForms.length - 1; i++) {
    const form = createdForms[i];
    
    // Randomly select 10-15 students to submit feedback
    const submittingStudents = [...students].sort(() => 0.5 - Math.random()).slice(0, 10 + Math.floor(Math.random() * 6));
    
    for (const student of submittingStudents) {
      formSubmissionsData.push({
        formId: form.id,
        userId: student.id,
        content: feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]
      });
    }
  }
  
  // Add a few submissions to the current form
  const currentForm = createdForms[createdForms.length - 1];
  const earlySubmitters = [...students].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  for (const student of earlySubmitters) {
    formSubmissionsData.push({
      formId: currentForm.id,
      userId: student.id,
      content: feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]
    });
  }
  
  // Insert all form submissions
  for (const submission of formSubmissionsData) {
    await db.insert(formSubmissionTable).values(submission);
  }
  
  console.log('✅ Form submissions created');

  // Create RAG resources
  console.log('Creating RAG resources...');

  // System FAQ - Enrollment
  await createResource(`
    FAQ - Course Enrollment:
    Q: How do I enroll in a course?
    A: Go to the Courses page, find the course you want to join, and click the "Enroll" button.
  `);

  // System FAQ - Assignments
  await createResource(`
    FAQ - Assignments:
    Q: When are assignments due?
    A: Each assignment has its own deadline displayed on the assignment page. You can see all your upcoming assignments on your dashboard.
    
      Q: Can I submit an assignment after the deadline?
    A: Late submissions are accepted but may be penalized at the lecturer's discretion.
  `);

  // System FAQ - Grading
  await createResource(`
    FAQ - Grading System:
    Q: How are grades calculated?
    A: Grades are assigned by lecturers based on your assignment submissions. The system calculates your average performance across all assignments in a course.
  `);

  // System FAQ - Progress
  await createResource(`
    FAQ - Progress Tracking:
    Q: How do I check my course progress?
    A: Visit your dashboard to see your performance metrics, including average grades and assignment completion rates.
  `);

  // Project Functionality - User Management
  await createResource(`
    Functionality - User Registration and Management:
    The system enables registration of students and teachers with specific roles (student, lecturer, administrator).
    Each role has different access levels and capabilities for analytics access.
    Users can manage their profiles and view information relevant to their role.
  `);

  // Project Functionality - Data Analysis
  await createResource(`
    Functionality - Data Analysis:
    The system tracks student performance by course, module, or group.
    It analyzes grade distribution (average, minimum, maximum, percentage of students achieving specific scores).
    The platform can identify risk of course failure based on grades and performance patterns.
    Performance prediction algorithms forecast the likelihood of successful course completion based on previous grades and activity.
  `);

  // Project Functionality - Data Visualization
  await createResource(`
    Functionality - Data Visualization:
    Users can view visualizations for course data including average grades, grade distribution, and assignment progress.
    The system provides dashboards for teachers to view overall course and group statistics.
    Students have access to real-time progress dashboards showing their performance.
    Heat maps are available to analyze grade distribution and activity across different learning aspects.
  `);

  // Project Functionality - Trend Analysis
  await createResource(`
    Functionality - Trend Analysis:
    The system identifies performance trends over time by comparing performance at different course stages.
    It can determine the impact of changes in the learning process on student grades.
    Grade dynamics analysis tracks changes in student grades over time, identifying declines or improvements.
  `);

  // Project Functionality - Feedback Analysis
  await createResource(`
    Functionality - Feedback Analysis:
    The platform analyzes survey and questionnaire results through sentiment analysis and identification of common issues.
    It compares survey results across different groups or courses to identify patterns.
    The system processes student responses to open-ended questions, identifying main trends or issues.
  `);

  // Project Functionality - Recommendations
  await createResource(`
    Functionality - Personalized Recommendations:
    The system provides data-driven recommendations for additional materials or courses based on student achievements and interests.
    Teachers receive recommendations on changing teaching methods or course content based on group performance analysis.
  `);

  // Project Functionality - Reports
  await createResource(`
    Functionality - Reports and Data Export:
    Users can generate detailed reports on analytics results for specific periods, including grade distribution, performance prediction, and trends.
    The system allows exporting analysis results to CSV, Excel, and PDF formats for further processing or presentations.
  `);

  console.log('✅ RAG resources created');
  console.log('🌱 Seeding completed');
} 

async function runSeed() {
  try {
    await seed();
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

runSeed(); 
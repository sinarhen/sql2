import { db } from './db';
import { users, courses, userCourses, assignments, assignmentSubmissions, forms, formSubmissions, resources, embeddings } from '../lib/db/drizzle/schema';
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
    await db.delete(formSubmissions);
    await db.delete(forms);
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
  
  const [lecturer] = await db.insert(users).values({
    name: 'John Lecturer',
    email: 'lecturer@example.com',
    passwordHash,
    role: 'lecturer',
  }).returning();
  
  const [student] = await db.insert(users).values({
    name: 'Jane Student',
    email: 'student@example.com',
    passwordHash,
    role: 'student',
  }).returning();
  
  console.log('✅ Users created');
  
  // Create courses
  const [course1] = await db.insert(courses).values({
    name: 'Introduction to Computer Science',
    lecturerId: lecturer.id
  }).returning();
  
  const [course2] = await db.insert(courses).values({
    name: 'Web Development Fundamentals',
    lecturerId: lecturer.id
  }).returning();
  
  console.log('✅ Courses created');
  
  // Create user-course relationships
  await db.insert(userCourses).values([
    {
      userId: lecturer.id,
      courseId: course1.id,
    },
    {
      userId: lecturer.id,
      courseId: course2.id,
    },
    {
      userId: student.id,
      courseId: course1.id,
    },
  ]);
  
  console.log('✅ Course enrollments created');
  
  // Create assignments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const [assignment1] = await db.insert(assignments).values({
    name: 'Week 1 Assignment',
    courseId: course1.id,
    deadline: tomorrow,
  }).returning();
  
  await db.insert(assignments).values({
    name: 'Final Project',
    courseId: course1.id,
    deadline: nextWeek,
  }).returning();
  
  console.log('✅ Assignments created');
  
  // Create assignment submissions
  await db.insert(assignmentSubmissions).values({
    assignmentId: assignment1.id,
    studentId: student.id,
    content: 'This is my submission for the Week 1 Assignment.',
    submission: new Date(),
    rating: 85,
  });
  
  console.log('✅ Assignment submissions created');
  
  // Create forms
  const [form1] = await db.insert(forms).values({
    name: 'Course Feedback',
    end: nextWeek,
  }).returning();
  
  console.log('✅ Forms created');
  
  // Create form submissions
  await db.insert(formSubmissions).values({
    formId: form1.id,
    userId: student.id,
    content: 'The course has been very informative so far.',
  });
  
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
  await db.insert(resources).values({
    content: `
      Functionality - Reports and Data Export:
      Users can generate detailed reports on analytics results for specific periods, including grade distribution, performance prediction, and trends.
      The system allows exporting analysis results to CSV, Excel, and PDF formats for further processing or presentations.
    `,
  });

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
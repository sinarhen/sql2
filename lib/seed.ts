import { db } from './db';
import { users, courses, userCourses, assignments, assignmentSubmissions, forms, formSubmissions } from '../lib/db/drizzle/schema';
import bcrypt from 'bcrypt';

export async function seed() {
  console.log('🌱 Seeding database...');
  
  // Clear database first
  try {
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
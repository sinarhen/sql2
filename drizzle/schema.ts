import { 
  sqliteTable,
  text,
  integer,
  real
} from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['lecturer', 'student', 'admin'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// UserCourse table (many-to-many relationship)
export const userCourses = sqliteTable('user_courses', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Assignment table
export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  deadline: integer('deadline', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// AssignmentSubmission table
export const assignmentSubmissions = sqliteTable('assignment_submissions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  rating: real('rating'),
  assignmentId: text('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  submission: integer('submission', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Form table
export const forms = sqliteTable('forms', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  end: integer('end', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// FormSubmission table
export const formSubmissions = sqliteTable('form_submissions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
}); 
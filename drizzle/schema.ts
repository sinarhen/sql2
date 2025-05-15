import { relations } from 'drizzle-orm';
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

export const usersRelations = relations(users, ({ many }) => ({
  userCourses: many(userCourses),
  assignmentSubmissions: many(assignmentSubmissions, { relationName: 'studentSubmissions' }),
  formSubmissions: many(formSubmissions),
}));

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userCourses: many(userCourses),
  assignments: many(assignments),
}));

// UserCourse table (many-to-many relationship)
export const userCourses = sqliteTable('user_courses', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const userCoursesRelations = relations(userCourses, ({ one }) => ({
  user: one(users, {
    fields: [userCourses.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userCourses.courseId],
    references: [courses.id],
  }),
}));

// Assignment table
export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  deadline: integer('deadline', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  submissions: many(assignmentSubmissions),
}));

// AssignmentSubmission table
export const assignmentSubmissions = sqliteTable('assignment_submissions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  rating: real('rating'),
  content: text('content'),
  assignmentId: text('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  submission: integer('submission', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentSubmissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [assignmentSubmissions.studentId],
    references: [users.id],
    relationName: 'studentSubmissions',
  }),
}));

// Form table
export const forms = sqliteTable('forms', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  end: integer('end', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const formsRelations = relations(forms, ({ many }) => ({
  submissions: many(formSubmissions),
}));

export const formSubmissions = sqliteTable('form_submissions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  content: text('content'),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
}); 

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(forms, {
    fields: [formSubmissions.formId],
    references: [forms.id],
  }),
  user: one(users, {
    fields: [formSubmissions.userId],
    references: [users.id],
  }),
})); 


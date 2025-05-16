import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './db/drizzle/schema';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

const sqlite = new Database('./sqlite.db');
export const db = drizzle(sqlite, { schema });

export const insertUserSchema = createInsertSchema(schema.users);
export const selectUserSchema = createSelectSchema(schema.users);

export const insertCourseSchema = createInsertSchema(schema.courses);
export const selectCourseSchema = createSelectSchema(schema.courses);

export const insertAssignmentSchema = createInsertSchema(schema.assignments);
export const selectAssignmentSchema = createSelectSchema(schema.assignments);

export const insertAssignmentSubmissionSchema = createInsertSchema(schema.assignmentSubmissions);
export const selectAssignmentSubmissionSchema = createSelectSchema(schema.assignmentSubmissions);

export const insertFormSchema = createInsertSchema(schema.forms);
export const selectFormSchema = createSelectSchema(schema.forms);

export const insertFormSubmissionSchema = createInsertSchema(schema.formSubmissions);
export const selectFormSubmissionSchema = createSelectSchema(schema.formSubmissions); 
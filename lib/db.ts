import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL);

// Create drizzle client
export const db = drizzle(client, { schema });

// Create schemas for zod validation
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
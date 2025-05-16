import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './db/drizzle/schema';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL as string,
});

export const db = drizzle(pool, { schema });

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
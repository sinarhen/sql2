import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './lib/db/drizzle/schema.ts',
  out: './lib/db/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
} satisfies Config; 
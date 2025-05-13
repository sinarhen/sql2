import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config; 
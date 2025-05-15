import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./sqlite.db',
  },
} satisfies Config; 
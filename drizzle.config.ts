import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './lib/db/drizzle/schema.ts',
  out: './lib/db/drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./sqlite.db',
  },
} satisfies Config; 
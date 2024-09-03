import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
dotenv.config({
    path: '.env.local',
});
export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
  dbCredentials: {
    host: process.env.DB_HOST as string, // Assert as string
    user: process.env.DB_USER as string | undefined, // Optional
    password: process.env.DB_PASSWORD as string | undefined, // Optional
    database: process.env.DB_NAME as string, // Assert as string
    ssl: false,
  },
  verbose: true,
  strict: true,
});
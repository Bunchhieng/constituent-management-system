import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, connection } from './db';
import dotenv from 'dotenv';
dotenv.config({
    path: '.env.local',
});

await migrate(db, { migrationsFolder: './drizzle' });
await connection.end();
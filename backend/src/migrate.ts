import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connection, db } from "./db";

dotenv.config({
	path: ".env.local",
});

// Suppress notices
await db.execute(sql`SET client_min_messages TO WARNING;`);

try {
	// Try to create the schema, but don't worry if it already exists
	try {
		await db.execute(sql`CREATE SCHEMA IF NOT EXISTS constituents;`);
		console.log('Schema "constituents" created or already exists.');
	} catch (schemaError: any) {
		if (schemaError.code === "42P06") {
			console.log(
				'Schema "constituents" already exists. Continuing with migration.',
			);
		} else {
			throw schemaError; // Re-throw if it's a different error
		}
	}

	// Proceed with migration
	await migrate(db, { migrationsFolder: "./drizzle" });
	console.log("Migration completed successfully");
} catch (error) {
	console.error("Migration failed:", error);
} finally {
	await connection.end();
}

import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
	console.log("Creating enums...");

	// Create enums if they don't exist
	await sql`
		DO $$ BEGIN
			CREATE TYPE landing_intent AS ENUM ('build', 'collaborate', 'connect');
		EXCEPTION
			WHEN duplicate_object THEN null;
		END $$;
	`;

	await sql`
		DO $$ BEGIN
			CREATE TYPE landing_locale AS ENUM ('es', 'en');
		EXCEPTION
			WHEN duplicate_object THEN null;
		END $$;
	`;

	console.log("Creating table...");

	// Create table
	await sql`
		CREATE TABLE IF NOT EXISTS intent_submissions (
			id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
			intent landing_intent NOT NULL,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			locale landing_locale NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
		);
	`;

	console.log("✓ Database initialized successfully");

	// Test query
	const result = await sql`SELECT * FROM intent_submissions`;
	console.log(`✓ Connection OK. Rows: ${result.length}`);
}

main().catch((err) => {
	console.error("Error:", err);
	process.exit(1);
});

import { pgSchema } from "drizzle-orm/pg-core";

// Derive schema name from project name env var, slugified to snake_case
const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME ?? "404 Tech Found";
const schemaName = projectName
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, "_")
	.replace(/^_|_$/g, "");

export const schema = pgSchema(schemaName);

// Single source of truth for the Postgres schema name used by this project.
// Imported by both pg-schema.ts (runtime) and drizzle.config.ts (drizzle-kit
// introspection / push / generate). Keeping this in one place is what stops
// drizzle-kit from silently introspecting the wrong (empty) schema and
// regenerating CREATE TYPE statements that already exist.

export function getSchemaName(): string {
	const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME ?? "404 Tech Found";
	return projectName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "");
}

import { dbEnv } from "./env";

// Single source of truth for the Postgres schema name used by this project.
// Imported by both pg-schema.ts (runtime) and drizzle.config.ts (drizzle-kit
// introspection / push / generate). Keeping this in one place is what stops
// drizzle-kit from silently introspecting the wrong (empty) schema and
// regenerating CREATE TYPE statements that already exist.
//
// Sourced from validated env (t3-env) — fail fast if NEXT_PUBLIC_PROJECT_NAME
// is missing rather than silently slugifying a fallback that may not match
// the real database schema.

export function getSchemaName(): string {
	return dbEnv.NEXT_PUBLIC_PROJECT_NAME.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "");
}

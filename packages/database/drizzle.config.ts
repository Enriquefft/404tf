import { defineConfig } from "drizzle-kit";
import { getSchemaName } from "./src/schema-name";

// schemaFilter must match what pg-schema.ts uses at runtime, otherwise
// drizzle-kit introspects the wrong schema (defaults to public), sees
// nothing, and regenerates CREATE TYPE for enums that already exist.
export default defineConfig({
	schema: ["./src/pg-schema.ts", "./src/schema.ts", "./src/map-schema.ts"],
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
	schemaFilter: [getSchemaName()],
	strict: true,
	verbose: true,
});

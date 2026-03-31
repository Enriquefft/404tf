import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: ["./src/pg-schema.ts", "./src/schema.ts", "./src/map-schema.ts"],
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
	strict: true,
	verbose: true,
});

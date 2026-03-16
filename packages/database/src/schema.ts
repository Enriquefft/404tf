import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Derive schema name from project name env var, slugified to snake_case
const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME ?? "404 Tech Found";
const schemaName = projectName
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, "_")
	.replace(/^_|_$/g, "");
export const schema = pgSchema(schemaName);

export const intentEnum = schema.enum("landing_intent", ["build", "collaborate", "connect"]);
export const localeEnum = schema.enum("landing_locale", ["es", "en"]);

export const intentSubmissions = schema.table("intent_submissions", {
	id: uuid("id").defaultRandom().primaryKey(),
	intent: intentEnum("intent").notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	locale: localeEnum("locale").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type IntentSubmission = typeof intentSubmissions.$inferSelect;
export type NewIntentSubmission = typeof intentSubmissions.$inferInsert;

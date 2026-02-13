import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Schema name for the 404 Tech Found project
export const schema = pgSchema("404 Tech Found");

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

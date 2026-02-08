import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const intentEnum = pgEnum("landing_intent", ["build", "collaborate", "connect"]);
export const localeEnum = pgEnum("landing_locale", ["es", "en"]);

export const intentSubmissions = pgTable("intent_submissions", {
	id: uuid("id").defaultRandom().primaryKey(),
	intent: intentEnum("intent").notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	locale: localeEnum("locale").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type IntentSubmission = typeof intentSubmissions.$inferSelect;
export type NewIntentSubmission = typeof intentSubmissions.$inferInsert;

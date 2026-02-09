import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { clientEnv } from "@/env/client";

export const schema = pgSchema(clientEnv.NEXT_PUBLIC_PROJECT_NAME);

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

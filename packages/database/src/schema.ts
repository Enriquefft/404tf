import { pgSchema, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

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

// SpecHack-specific enums
export const spechackLocaleEnum = schema.enum("spechack_locale", ["es", "en"]);
export const spechackTrackEnum = schema.enum("spechack_track", [
	"virtual",
	"hub",
]);
export const ambassadorStatusEnum = schema.enum("spechack_ambassador_status", [
	"pending",
	"approved",
	"rejected",
]);

// SpecHack participants table (hackathon registrations)
export const spechackParticipants = schema.table("spechack_participants", {
	id: uuid("id").defaultRandom().primaryKey(),
	agentNumber: serial("agent_number").notNull(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	city: text("city").notNull(),
	track: spechackTrackEnum("track").notNull(),
	builderClass: text("builder_class"), // assigned randomly at registration
	gradientData: text("gradient_data"), // JSON: {"from":"hsl(...)","to":"hsl(...)","angle":180}
	locale: spechackLocaleEnum("locale").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// SpecHack ambassadors table (hub ambassador applications)
export const spechackAmbassadors = schema.table("spechack_ambassadors", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	city: text("city").notNull(),
	community: text("community").notNull(),
	status: ambassadorStatusEnum("status").notNull().default("pending"),
	locale: spechackLocaleEnum("locale").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// SpecHack type exports
export type SpechackParticipant = typeof spechackParticipants.$inferSelect;
export type NewSpechackParticipant = typeof spechackParticipants.$inferInsert;
export type SpechackAmbassador = typeof spechackAmbassadors.$inferSelect;
export type NewSpechackAmbassador = typeof spechackAmbassadors.$inferInsert;

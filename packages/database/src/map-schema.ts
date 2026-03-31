import {
	boolean,
	integer,
	jsonb,
	real,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { schema } from "./pg-schema";

// ---------------------------------------------------------------------------
// Enums (use schema.enum to keep them in the custom schema, not public)
// ---------------------------------------------------------------------------

export const mapVerticalEnum = schema.enum("map_vertical", [
	"ai_ml",
	"biotech",
	"hardware_robotics",
	"cleantech",
	"agritech",
	"healthtech",
	"advanced_materials",
	"aerospace",
	"quantum",
	"other",
]);

export const mapMaturityEnum = schema.enum("map_maturity", [
	"rd",
	"prototype",
	"pilot",
	"revenue",
]);

export const mapEditStatusEnum = schema.enum("map_edit_status", [
	"published",
	"pending_review",
	"changes_requested",
]);

// ---------------------------------------------------------------------------
// map_startups
// ---------------------------------------------------------------------------

export const mapStartups = schema.table("map_startups", {
	id: serial("id").primaryKey(),
	slug: text("slug").unique().notNull(),
	name: text("name").notNull(),

	// Bilingual content — Spanish base, _en suffix for English
	oneLiner: text("one_liner"),
	oneLinerEn: text("one_liner_en"),
	techDescription: text("tech_description"),
	techDescriptionEn: text("tech_description_en"),
	keyResults: jsonb("key_results"),
	keyResultsEn: jsonb("key_results_en"),
	problemStatement: text("problem_statement"),
	problemStatementEn: text("problem_statement_en"),
	businessModel: text("business_model"),
	businessModelEn: text("business_model_en"),

	// Location
	country: text("country").notNull(),
	countryEs: text("country_es"),
	city: text("city").notNull(),
	lat: real("lat"),
	lng: real("lng"),

	// Classification
	verticals: text("verticals").array(),
	maturityLevel: mapMaturityEnum("maturity_level"),
	foundingYear: integer("founding_year"),

	// Funding & team
	fundingReceived: text("funding_received"),
	teamSize: integer("team_size"),

	// Links
	websiteUrl: text("website_url"),
	socialLinks: jsonb("social_links"),

	// Media
	logoPath: text("logo_path"),
	heroImagePath: text("hero_image_path"),
	founderPhotos: jsonb("founder_photos"),
	partnerLogos: text("partner_logos").array(),
	videoUrl: text("video_url"),
	videoLabel: text("video_label"),

	// Contact
	contactName: text("contact_name"),
	contactRole: text("contact_role"),
	contactEmail: text("contact_email"),
	contactPhone: text("contact_phone"),
	contactLinkedin: text("contact_linkedin"),
	supportNeeded: text("support_needed"),

	// Claiming
	claimed: boolean("claimed").default(false),
	claimedByEmail: text("claimed_by_email"),
	claimApproved: boolean("claim_approved").default(false),

	// Moderation
	lastEditedAt: timestamp("last_edited_at", { withTimezone: true }),
	editStatus: mapEditStatusEnum("edit_status").default("published"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export type MapStartup = typeof mapStartups.$inferSelect;
export type NewMapStartup = typeof mapStartups.$inferInsert;

// ---------------------------------------------------------------------------
// map_corporate_leads
// ---------------------------------------------------------------------------

export const mapCorporateLeads = schema.table("map_corporate_leads", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	company: text("company"),
	role: text("role"),
	industry: text("industry"),
	challenge: text("challenge"),
	timeline: text("timeline"),
	notes: text("notes"),
	contextStartupSlug: text("context_startup_slug"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export type MapCorporateLead = typeof mapCorporateLeads.$inferSelect;
export type NewMapCorporateLead = typeof mapCorporateLeads.$inferInsert;

// ---------------------------------------------------------------------------
// map_startup_applications
// ---------------------------------------------------------------------------

export const mapStartupApplications = schema.table("map_startup_applications", {
	id: serial("id").primaryKey(),
	startupName: text("startup_name").notNull(),
	website: text("website"),
	contactName: text("contact_name").notNull(),
	contactRole: text("contact_role"),
	email: text("email").notNull(),
	country: text("country"),
	vertical: text("vertical"),
	maturity: text("maturity"),
	oneLiner: text("one_liner"),
	pitch: text("pitch"),
	status: text("status").default("new"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export type MapStartupApplication = typeof mapStartupApplications.$inferSelect;
export type NewMapStartupApplication =
	typeof mapStartupApplications.$inferInsert;

// ---------------------------------------------------------------------------
// map_startup_program_inquiries
// ---------------------------------------------------------------------------

export const mapStartupProgramInquiries = schema.table(
	"map_startup_program_inquiries",
	{
		id: serial("id").primaryKey(),
		startupName: text("startup_name").notNull(),
		contactName: text("contact_name").notNull(),
		email: text("email").notNull(),
		tierInterest: text("tier_interest"),
		description: text("description"),
		status: text("status").default("new"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
);

export type MapStartupProgramInquiry =
	typeof mapStartupProgramInquiries.$inferSelect;
export type NewMapStartupProgramInquiry =
	typeof mapStartupProgramInquiries.$inferInsert;

// ---------------------------------------------------------------------------
// map_report_downloads
// ---------------------------------------------------------------------------

export const mapReportDownloads = schema.table("map_report_downloads", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export type MapReportDownload = typeof mapReportDownloads.$inferSelect;
export type NewMapReportDownload = typeof mapReportDownloads.$inferInsert;

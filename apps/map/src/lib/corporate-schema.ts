import { z } from "zod";

export const ROLE_OPTIONS = [
	"innovation_director",
	"cto",
	"procurement",
	"strategy",
	"government",
	"vc",
	"other",
] as const;

export const INDUSTRY_OPTIONS = [
	"mining",
	"energy",
	"agriculture",
	"manufacturing",
	"financial",
	"healthcare",
	"logistics",
	"retail",
	"telecom",
	"government",
	"other",
] as const;

export const TIMELINE_OPTIONS = ["exploring", "1_3", "3_6", "6_12"] as const;

export const corporateLeadSchema = z.object({
	name: z.string().min(1, "required"),
	email: z.email("invalid_email"),
	company: z.string().optional(),
	role: z.string().optional(),
	industry: z.string().min(1, "required"),
	challenge: z.string().min(1, "required"),
	timeline: z.string().optional(),
	notes: z.string().optional(),
	contextStartupSlug: z.string().optional(),
	honeypot: z.string().max(0).optional(),
});

export type CorporateLeadData = z.infer<typeof corporateLeadSchema>;

/** Step 1 fields only — used for client-side step validation. */
export const step1Schema = z.object({
	name: z.string().min(1, "required"),
	email: z.email("invalid_email"),
	company: z.string().optional(),
	role: z.string().optional(),
});

/** Step 2 fields only — used for client-side step validation. */
export const step2Schema = z.object({
	industry: z.string().min(1, "required"),
	challenge: z.string().min(1, "required"),
	timeline: z.string().optional(),
	notes: z.string().optional(),
});

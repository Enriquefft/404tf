import { mapMaturityEnum, mapVerticalEnum } from "@404tf/database/schema";
import { z } from "zod";

// Single source of truth for the StartupRecord shape consumed by Astro pages,
// React islands, and API routes. Runtime (Zod) validation enforces the shape;
// TypeScript types flow from the inferred Zod output.
//
// Vertical / Maturity literals come from the pgEnum (`mapVerticalEnum`,
// `mapMaturityEnum`). Adding a value to the DB enum immediately widens the
// Zod types here — no manual sync needed.
//
// The DB → StartupRecord projection lives in db-queries.ts::toStartupRecord;
// that function is typed with `mapStartups.$inferSelect` as input so the
// TS compiler catches any column rename at the mapping layer.

export const verticalKeySchema = z.enum(mapVerticalEnum.enumValues);
export const maturityKeySchema = z.enum(mapMaturityEnum.enumValues);

export type VerticalKey = z.infer<typeof verticalKeySchema>;
export type MaturityKey = z.infer<typeof maturityKeySchema>;

export const VERTICAL_KEYS = mapVerticalEnum.enumValues;
export const MATURITY_KEYS = mapMaturityEnum.enumValues;

export const keyResultSchema = z.object({
	type: z.string(),
	title: z.string(),
	description: z.string(),
	partner: z.string().optional(),
});

export const founderPhotoSchema = z.object({
	image_path: z.string(),
	name: z.string(),
	role: z.string(),
	linkedin_url: z.string().optional(),
});

export const socialLinksSchema = z.record(z.string(), z.string());

// StartupRecord = the public consumer shape (snake_case, bilingual). One row
// per `map_startups` entry with non-null coerced defaults for fields that the
// UI requires (country_es, coordinates, maturity, founding_year).
export const startupRecordSchema = z.object({
	slug: z.string(),
	name: z.string(),
	one_liner: z.string(),
	one_liner_en: z.string().nullable(),
	country: z.string(),
	country_es: z.string(),
	city: z.string(),
	lat: z.number(),
	lng: z.number(),
	verticals: z.array(verticalKeySchema).readonly(),
	maturity_level: maturityKeySchema,
	founding_year: z.number().int(),
	tech_description: z.string().nullable(),
	tech_description_en: z.string().nullable(),
	key_results: z.array(keyResultSchema).nullable(),
	key_results_en: z.array(keyResultSchema).nullable(),
	problem_statement: z.string().nullable(),
	problem_statement_en: z.string().nullable(),
	business_model: z.string().nullable(),
	business_model_en: z.string().nullable(),
	funding_received: z.string().nullable(),
	team_size: z.number().int().nullable(),
	website_url: z.string().nullable(),
	social_links: socialLinksSchema.nullable(),
	contact_name: z.string().nullable(),
	contact_role: z.string().nullable(),
	contact_email: z.string().nullable(),
	contact_phone: z.string().nullable(),
	contact_linkedin: z.string().nullable(),
	claimed: z.boolean(),
	logo_path: z.string().nullable(),
	hero_image_path: z.string().nullable(),
	founder_photos: z.array(founderPhotoSchema).nullable(),
	partner_logos: z.array(z.string()).nullable(),
	video_url: z.string().nullable(),
	video_label: z.string().nullable(),
});

export type StartupRecord = z.infer<typeof startupRecordSchema>;
export type KeyResult = z.infer<typeof keyResultSchema>;
export type FounderPhoto = z.infer<typeof founderPhotoSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;

export const startupListSchema = z.array(startupRecordSchema);

import { mapMaturityEnum, mapVerticalEnum } from "@404tf/database/schema";
import { z } from "zod";

// Single source of truth for the shape of seed.json. Both the build-time
// generator (scripts/generate-seed.ts) and the runtime consumers (Astro
// pages, React islands) parse against this schema, so any drift between
// the database, the seed file, and the consuming code fails loudly at
// build time instead of silently at runtime.
//
// Vertical and maturity literals are derived from the Drizzle pgEnum so
// they cannot drift from the database.

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

export const seedStartupSchema = z.object({
	slug: z.string(),
	name: z.string(),
	one_liner: z.string(),
	one_liner_en: z.string().nullable(),
	country: z.string(),
	country_es: z.string(),
	city: z.string(),
	lat: z.number(),
	lng: z.number(),
	verticals: z.array(verticalKeySchema),
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
	social_links: z.record(z.string(), z.string()).nullable(),
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

export type SeedStartup = z.infer<typeof seedStartupSchema>;
export type KeyResult = z.infer<typeof keyResultSchema>;
export type FounderPhoto = z.infer<typeof founderPhotoSchema>;

export const seedFileSchema = z.array(seedStartupSchema);

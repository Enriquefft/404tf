/**
 * Seed script for 404 Mapped startups.
 *
 * Reads src/data/seed.json and inserts all 50 startups into the
 * map_startups table via Drizzle ORM.
 *
 * Usage: bun run scripts/seed.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@404tf/database";
import type { NewMapStartup } from "@404tf/database/schema";
import { mapStartups } from "@404tf/database/schema";

const SEED_PATH = join(import.meta.dir, "../src/data/seed.json");

interface SeedEntry {
	slug: string;
	name: string;
	one_liner: string | null;
	one_liner_en: string | null;
	country: string;
	country_es: string;
	city: string;
	lat: number;
	lng: number;
	verticals: string[];
	maturity_level: string;
	founding_year: number | null;
	tech_description: string | null;
	tech_description_en: string | null;
	key_results: unknown;
	key_results_en: unknown;
	problem_statement: string | null;
	problem_statement_en: string | null;
	business_model: string | null;
	business_model_en: string | null;
	funding_received: string | null;
	team_size: number | null;
	website_url: string | null;
	social_links: Record<string, string> | null;
	contact_name: string | null;
	contact_role: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	contact_linkedin: string | null;
	claimed: boolean;
	logo_path: string | null;
	hero_image_path: string | null;
	founder_photos: unknown;
	partner_logos: string[] | null;
	video_url: string | null;
	video_label: string | null;
}

function toInsertRow(entry: SeedEntry): NewMapStartup {
	return {
		slug: entry.slug,
		name: entry.name,
		oneLiner: entry.one_liner,
		oneLinerEn: entry.one_liner_en,
		techDescription: entry.tech_description,
		techDescriptionEn: entry.tech_description_en,
		keyResults: entry.key_results,
		keyResultsEn: entry.key_results_en,
		problemStatement: entry.problem_statement,
		problemStatementEn: entry.problem_statement_en,
		businessModel: entry.business_model,
		businessModelEn: entry.business_model_en,
		country: entry.country,
		countryEs: entry.country_es,
		city: entry.city,
		lat: entry.lat,
		lng: entry.lng,
		verticals: entry.verticals,
		maturityLevel: entry.maturity_level as NewMapStartup["maturityLevel"],
		foundingYear: entry.founding_year,
		fundingReceived: entry.funding_received,
		teamSize: entry.team_size,
		websiteUrl: entry.website_url,
		socialLinks: entry.social_links,
		logoPath: entry.logo_path,
		heroImagePath: entry.hero_image_path,
		founderPhotos: entry.founder_photos,
		partnerLogos: entry.partner_logos,
		videoUrl: entry.video_url,
		videoLabel: entry.video_label,
		contactName: entry.contact_name,
		contactRole: entry.contact_role,
		contactEmail: entry.contact_email,
		contactPhone: entry.contact_phone,
		contactLinkedin: entry.contact_linkedin,
		claimed: entry.claimed,
	};
}

async function seed() {
	console.log("Reading seed data from:", SEED_PATH);

	const raw = readFileSync(SEED_PATH, "utf-8");
	const entries: SeedEntry[] = JSON.parse(raw);

	console.log(`Found ${entries.length} startups to insert.`);

	const rows = entries.map(toInsertRow);

	// Insert in batches of 10 to avoid hitting query size limits
	const BATCH_SIZE = 10;
	let inserted = 0;

	for (let i = 0; i < rows.length; i += BATCH_SIZE) {
		const batch = rows.slice(i, i + BATCH_SIZE);
		await db.insert(mapStartups).values(batch);
		inserted += batch.length;
		console.log(`  Inserted ${inserted}/${rows.length} startups`);
	}

	console.log(`\nDone. ${inserted} startups seeded successfully.`);
}

seed().catch((error: unknown) => {
	console.error("Seed failed:", error);
	process.exit(1);
});

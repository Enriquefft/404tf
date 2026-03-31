/**
 * Generate seed.json from the database.
 *
 * Queries all startups from map_startups and writes src/data/seed.json.
 * This makes the database the single source of truth — seed.json becomes
 * a build artifact that Astro reads at static generation time.
 *
 * Usage: bun run scripts/generate-seed.ts
 * Runs automatically before `astro build` via the build script.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@404tf/database";
import type { MapStartup } from "@404tf/database/schema";
import { mapStartups } from "@404tf/database/schema";
import type { SeedStartup } from "../src/lib/seed-types";

const OUTPUT_PATH = join(import.meta.dir, "../src/data/seed.json");

function toSeedEntry(row: MapStartup): SeedStartup {
	return {
		slug: row.slug,
		name: row.name,
		one_liner: row.oneLiner ?? "",
		one_liner_en: row.oneLinerEn ?? null,
		country: row.country,
		country_es: row.countryEs ?? row.country,
		city: row.city,
		lat: row.lat ?? 0,
		lng: row.lng ?? 0,
		verticals: row.verticals ?? [],
		maturity_level: row.maturityLevel ?? "prototype",
		founding_year: row.foundingYear ?? 0,
		tech_description: row.techDescription ?? null,
		tech_description_en: row.techDescriptionEn ?? null,
		key_results: (row.keyResults as SeedStartup["key_results"]) ?? null,
		key_results_en: (row.keyResultsEn as SeedStartup["key_results_en"]) ?? null,
		problem_statement: row.problemStatement ?? null,
		problem_statement_en: row.problemStatementEn ?? null,
		business_model: row.businessModel ?? null,
		business_model_en: row.businessModelEn ?? null,
		funding_received: row.fundingReceived ?? null,
		team_size: row.teamSize ?? null,
		website_url: row.websiteUrl ?? null,
		social_links: (row.socialLinks as SeedStartup["social_links"]) ?? null,
		contact_name: row.contactName ?? null,
		contact_role: row.contactRole ?? null,
		contact_email: row.contactEmail ?? null,
		contact_phone: row.contactPhone ?? null,
		contact_linkedin: row.contactLinkedin ?? null,
		claimed: row.claimed ?? false,
		logo_path: row.logoPath ?? null,
		hero_image_path: row.heroImagePath ?? null,
		founder_photos: (row.founderPhotos as SeedStartup["founder_photos"]) ?? null,
		partner_logos: row.partnerLogos ?? null,
		video_url: row.videoUrl ?? null,
		video_label: row.videoLabel ?? null,
	};
}

async function generate() {
	console.log("Querying startups from database...");

	const rows = await db.select().from(mapStartups);

	if (rows.length === 0) {
		console.warn("WARNING: No startups found in database. Writing empty array.");
	}

	const seed = rows.map(toSeedEntry).sort((a, b) => a.name.localeCompare(b.name));

	writeFileSync(OUTPUT_PATH, JSON.stringify(seed, null, "\t"), "utf-8");
	console.log(`Wrote ${seed.length} startups to ${OUTPUT_PATH}`);
}

generate().catch((error: unknown) => {
	console.error("Generate seed failed:", error);
	process.exit(1);
});

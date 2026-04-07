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

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "@404tf/database";
import type { MapStartup } from "@404tf/database/schema";
import { mapStartups } from "@404tf/database/schema";
import { type SeedStartup, seedStartupSchema } from "../src/lib/seed-schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "../src/data/seed.json");

// Constructs the snake_case seed row from the camelCase DB row and validates
// it through the Zod schema. This replaces a pile of `as SeedStartup[...]`
// casts on the jsonb columns with actual runtime validation — if the DB ever
// holds malformed JSON blobs, the build fails loudly with a clear message
// instead of propagating bad data into the static site.
function toSeedEntry(row: MapStartup): SeedStartup {
	const input: Record<string, unknown> = {
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
		key_results: row.keyResults ?? null,
		key_results_en: row.keyResultsEn ?? null,
		problem_statement: row.problemStatement ?? null,
		problem_statement_en: row.problemStatementEn ?? null,
		business_model: row.businessModel ?? null,
		business_model_en: row.businessModelEn ?? null,
		funding_received: row.fundingReceived ?? null,
		team_size: row.teamSize ?? null,
		website_url: row.websiteUrl ?? null,
		social_links: row.socialLinks ?? null,
		contact_name: row.contactName ?? null,
		contact_role: row.contactRole ?? null,
		contact_email: row.contactEmail ?? null,
		contact_phone: row.contactPhone ?? null,
		contact_linkedin: row.contactLinkedin ?? null,
		claimed: row.claimed ?? false,
		logo_path: row.logoPath ?? null,
		hero_image_path: row.heroImagePath ?? null,
		founder_photos: row.founderPhotos ?? null,
		partner_logos: row.partnerLogos ?? null,
		video_url: row.videoUrl ?? null,
		video_label: row.videoLabel ?? null,
	};

	const parsed = seedStartupSchema.safeParse(input);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.slice(0, 5)
			.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
			.join("\n");
		throw new Error(
			`Row "${row.slug}" failed schema validation:\n${issues}\n\nFix the DB row or update the schema.`,
		);
	}
	return parsed.data;
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

	// Format with Biome so the generated file matches the project's formatter
	// rules (single source of truth for formatting). Without this, biome check
	// complains on every run because JSON.stringify always writes multi-line
	// arrays while biome collapses short arrays to a single line.
	const result = spawnSync("bunx", ["biome", "format", "--write", OUTPUT_PATH], {
		cwd: join(__dirname, ".."),
		stdio: "inherit",
	});
	if (result.status !== 0) {
		throw new Error(`Biome format failed for ${OUTPUT_PATH} (exit ${result.status})`);
	}
}

generate().catch((error: unknown) => {
	console.error("Generate seed failed:", error);
	process.exit(1);
});

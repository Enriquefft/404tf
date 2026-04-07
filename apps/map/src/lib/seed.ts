import seedJson from "@/data/seed.json";
import { type SeedStartup, seedFileSchema } from "@/lib/seed-schema";

// Parse the build-time seed.json against the Zod schema once at module load.
// If generate-seed.ts ever produces a shape that drifts from the schema (or
// the schema falls out of sync with the DB enums), the build fails loudly
// here instead of crashing at request time with a confusing TypeError.
const parsed = seedFileSchema.safeParse(seedJson);

if (!parsed.success) {
	const issues = parsed.error.issues
		.slice(0, 5)
		.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
		.join("\n");
	throw new Error(
		`seed.json failed schema validation. First issues:\n${issues}\n\nRun \`bun run scripts/generate-seed.ts\` after the schema was updated.`,
	);
}

export const startups: readonly SeedStartup[] = parsed.data;
export type { SeedStartup };

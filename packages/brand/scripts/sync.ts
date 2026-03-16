/**
 * Sync script — copies brand assets to app public/ directories.
 *
 * Run: bun run sync (from packages/brand/)
 *   or: bun run --filter='@404tf/brand' sync
 */

import { cp, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

const BRAND_DIR = join(import.meta.dir, "..");
const SVG_DIR = join(BRAND_DIR, "assets/logos/svg");
const GENERATED_DIR = join(BRAND_DIR, "assets/logos/generated");
const REPO_ROOT = join(BRAND_DIR, "../..");

const targets = [
	{
		name: "landing",
		dir: join(REPO_ROOT, "apps/landing/public/brand"),
		svgs: true,
		generated: true,
	},
	{
		name: "map",
		dir: join(REPO_ROOT, "apps/map/public/brand"),
		svgs: ["logo-transparent-ondark.svg"],
		generated: false,
	},
];

async function copyFiles(srcDir: string, destDir: string, filter?: string[]) {
	const files = await readdir(srcDir);
	const toCopy = filter ? files.filter((f) => filter.includes(f)) : files;

	for (const file of toCopy) {
		if (file === ".gitkeep") continue;
		await cp(join(srcDir, file), join(destDir, file));
	}
	return toCopy.length;
}

async function main() {
	for (const target of targets) {
		console.log(`Syncing to ${target.name}...`);
		await mkdir(target.dir, { recursive: true });

		let count = 0;

		if (target.svgs === true) {
			count += await copyFiles(SVG_DIR, target.dir);
		} else if (Array.isArray(target.svgs)) {
			count += await copyFiles(SVG_DIR, target.dir, target.svgs);
		}

		if (target.generated) {
			count += await copyFiles(GENERATED_DIR, target.dir);
		}

		console.log(`  ${count} files -> ${target.dir}`);
	}

	console.log("\nDone.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

/**
 * Logomark export — generates all 4 marks × color variants × sizes.
 *
 * Marks:
 *   duotone   — primary logomark (purple 4s, amber 0, purple strike)
 *   amber     — favicon mark (amber 404, purple strike)
 *   negative  — social avatar (purple bg, dark 404, amber strike)
 *   stacked   — full lockup (amber 404 + TECH FOUND)
 *
 * Run: bun run packages/brand/scripts/export-logomark.ts
 */

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const ASSETS_DIR = join(import.meta.dir, "../assets");
const OUTPUT_DIR = join(ASSETS_DIR, "logos/generated");
const FONTS_DIR = join(ASSETS_DIR, "fonts");

async function loadFont(filename: string): Promise<ArrayBuffer> {
	const buf = await readFile(join(FONTS_DIR, filename));
	return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
	darkBg: "#120918",
	lightBg: "#FAF8F3",
	purple: "#8E2CD7",
	amber: "#F77F00",
	muted: "#6D6670",
	fgDark: "#E9E3E0",
	fgLight: "#2D1856",
};

const SIZE = 512;

// ─── Mark builders ───────────────────────────────────────────────────────────

type MarkConfig = {
	bg: string;
	numColor: string;
	zeroColor: string;
	strikeColor: string;
	subtextColor?: string;
};

function buildCompactMark(cfg: MarkConfig) {
	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: SIZE,
				height: SIZE,
				backgroundColor: cfg.bg,
			},
			children: {
				type: "div",
				props: {
					style: {
						display: "flex",
						flexDirection: "row",
						alignItems: "baseline",
						fontFamily: "Big Shoulders Display",
						fontWeight: 800,
						fontSize: 220,
						letterSpacing: -8,
					},
					children: [
						{ type: "span", props: { style: { color: cfg.numColor }, children: "4" } },
						{
							type: "span",
							props: {
								style: {
									color: cfg.zeroColor,
									textDecoration: "line-through",
									textDecorationColor: cfg.strikeColor,
									textDecorationThickness: 12,
								},
								children: "0",
							},
						},
						{ type: "span", props: { style: { color: cfg.numColor }, children: "4" } },
					],
				},
			},
		},
	};
}

function buildStackedMark(cfg: MarkConfig & { subtextColor: string }) {
	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: SIZE,
				height: SIZE,
				backgroundColor: cfg.bg,
				gap: 4,
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "row",
							fontFamily: "Big Shoulders Display",
							fontWeight: 800,
							fontSize: 180,
							letterSpacing: -6,
							lineHeight: 0.85,
						},
						children: [
							{ type: "span", props: { style: { color: cfg.numColor }, children: "4" } },
							{
								type: "span",
								props: {
									style: {
										color: cfg.zeroColor,
										textDecoration: "line-through",
										textDecorationColor: cfg.strikeColor,
										textDecorationThickness: 10,
									},
									children: "0",
								},
							},
							{ type: "span", props: { style: { color: cfg.numColor }, children: "4" } },
						],
					},
				},
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							fontFamily: "Big Shoulders Display",
							fontWeight: 500,
							fontSize: 40,
							color: cfg.subtextColor,
							letterSpacing: 8,
						},
						children: [
							{ type: "span", props: { children: "TECH\u00A0F" } },
							{
								type: "span",
								props: {
									style: { textDecoration: "line-through", textDecorationThickness: 2 },
									children: "O",
								},
							},
							{ type: "span", props: { children: "UND" } },
						],
					},
				},
			],
		},
	};
}

// ─── Mark definitions ────────────────────────────────────────────────────────

type MarkDef = {
	name: string;
	variants: { suffix: string; element: object }[];
};

function allMarks(): MarkDef[] {
	return [
		{
			name: "duotone",
			variants: [
				{
					suffix: "dark",
					element: buildCompactMark({
						bg: C.darkBg, numColor: C.purple, zeroColor: C.amber, strikeColor: C.purple,
					}),
				},
				{
					suffix: "light",
					element: buildCompactMark({
						bg: C.lightBg, numColor: C.purple, zeroColor: C.amber, strikeColor: C.purple,
					}),
				},
				{
					suffix: "transparent-ondark",
					element: buildCompactMark({
						bg: "transparent", numColor: C.purple, zeroColor: C.amber, strikeColor: C.purple,
					}),
				},
				{
					suffix: "transparent-onlight",
					element: buildCompactMark({
						bg: "transparent", numColor: C.purple, zeroColor: C.amber, strikeColor: C.purple,
					}),
				},
				{
					suffix: "white",
					element: buildCompactMark({
						bg: "transparent", numColor: "#FFFFFF", zeroColor: "#FFFFFF", strikeColor: "#FFFFFF",
					}),
				},
				{
					suffix: "black",
					element: buildCompactMark({
						bg: "transparent", numColor: "#1A1A1A", zeroColor: "#1A1A1A", strikeColor: "#1A1A1A",
					}),
				},
			],
		},
		{
			name: "amber",
			variants: [
				{
					suffix: "dark",
					element: buildCompactMark({
						bg: C.darkBg, numColor: C.amber, zeroColor: C.amber, strikeColor: C.purple,
					}),
				},
				{
					suffix: "light",
					element: buildCompactMark({
						bg: C.lightBg, numColor: C.amber, zeroColor: C.amber, strikeColor: C.purple,
					}),
				},
				{
					suffix: "transparent",
					element: buildCompactMark({
						bg: "transparent", numColor: C.amber, zeroColor: C.amber, strikeColor: C.purple,
					}),
				},
			],
		},
		{
			name: "negative",
			variants: [
				{
					suffix: "purple",
					element: buildCompactMark({
						bg: C.purple, numColor: C.darkBg, zeroColor: C.darkBg, strikeColor: C.amber,
					}),
				},
				{
					suffix: "amber",
					element: buildCompactMark({
						bg: C.amber, numColor: C.darkBg, zeroColor: C.darkBg, strikeColor: C.purple,
					}),
				},
			],
		},
		{
			name: "stacked",
			variants: [
				{
					suffix: "dark",
					element: buildStackedMark({
						bg: C.darkBg, numColor: C.amber, zeroColor: C.amber, strikeColor: C.purple, subtextColor: C.muted,
					}),
				},
				{
					suffix: "light",
					element: buildStackedMark({
						bg: C.lightBg, numColor: C.amber, zeroColor: C.amber, strikeColor: C.purple, subtextColor: C.fgLight,
					}),
				},
				{
					suffix: "transparent-ondark",
					element: buildStackedMark({
						bg: "transparent", numColor: C.amber, zeroColor: C.amber, strikeColor: C.purple, subtextColor: C.muted,
					}),
				},
			],
		},
	];
}

// ─── Sizes ───────────────────────────────────────────────────────────────────

const EXPORT_SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	console.log("Loading fonts...");
	const fontBold = await loadFont("BigShouldersDisplay-ExtraBold.ttf");
	const fontMedium = await loadFont("BigShouldersDisplay-Medium.ttf");

	const fonts = [
		{ name: "Big Shoulders Display", data: fontBold, weight: 800, style: "normal" },
		{ name: "Big Shoulders Display", data: fontMedium, weight: 500, style: "normal" },
	];

	const markDir = join(OUTPUT_DIR, "marks");
	await mkdir(markDir, { recursive: true });
	console.log(`Output: ${markDir}\n`);

	let total = 0;

	for (const mark of allMarks()) {
		console.log(`Mark: ${mark.name}`);

		for (const variant of mark.variants) {
			const baseName = `mark-${mark.name}-${variant.suffix}`;

			// SVG
			const svg = await satori(variant.element as any, {
				width: SIZE, height: SIZE, fonts, embedFont: true,
			});
			await writeFile(join(markDir, `${baseName}.svg`), svg, "utf-8");
			console.log(`  + ${baseName}.svg`);
			total++;

			// PNGs at all sizes
			for (const size of EXPORT_SIZES) {
				const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
				await writeFile(join(markDir, `${baseName}-${size}.png`), resvg.render().asPng());
				total++;
			}
			console.log(`  + ${baseName} × ${EXPORT_SIZES.length} PNGs`);
		}
	}

	console.log(`\nDone — ${total} files written to ${markDir}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

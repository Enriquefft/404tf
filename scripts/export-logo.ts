/**
 * Logo export script — generates PNG + SVG brand assets from logo JSX
 * Uses Satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG)
 *
 * Run: bun run logo:export
 * Output: apps/landing/public/brand/
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

// ─── Config ────────────────────────────────────────────────────────────────

const OUTPUT_DIR = join(import.meta.dir, "../apps/landing/public/brand");

// Rectangular: width-based, height auto from content
const SIZES = [64, 128, 256, 512, 1024, 1200];

// Square: centered logo on equal-sided canvas (avatars, app icons, favicons)
const SQUARE_SIZES = [16, 32, 64, 128, 256, 512, 1024];

// Dark variant: dark bg, white text (default brand)
// Light variant: white bg, dark text
type Variant = {
	name: string;
	bg: string;
	text: string;
	subtext: string;
};

const VARIANTS: Variant[] = [
	{
		name: "dark",
		bg: "#121212",
		text: "#fafafa", // --foreground: 0 0% 98%
		subtext: "#a3a3a3", // --muted-foreground: 0 0% 64%
	},
	{
		name: "light",
		bg: "#ffffff",
		text: "#1a1a1a",
		subtext: "#6b6b6b",
	},
	// Transparent bg — text color optimised for dark backgrounds
	{
		name: "transparent-ondark",
		bg: "transparent",
		text: "#fafafa",
		subtext: "#a3a3a3",
	},
	// Transparent bg — text color optimised for light backgrounds
	{
		name: "transparent-onlight",
		bg: "transparent",
		text: "#1a1a1a",
		subtext: "#6b6b6b",
	},
];

// ─── Font loading ───────────────────────────────────────────────────────────

async function loadFont(family: string, weight: number): Promise<ArrayBuffer> {
	// Google Fonts v1 API returns TTF — Satori supports TTF but not woff2.
	const cssUrl = `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}`;
	const cssRes = await fetch(cssUrl);
	const css = await cssRes.text();

	const match = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
	if (!match) {
		throw new Error(
			`Could not find TTF URL for ${family} weight ${weight}.\nCSS response:\n${css}`,
		);
	}

	const fontRes = await fetch(match[1]);
	return fontRes.arrayBuffer();
}

// ─── Logo JSX builders ──────────────────────────────────────────────────────

function buildLogoElement(variant: Variant, width: number) {
	// Scale text sizes proportionally to the requested width.
	// Base design at width=400: "404" at ~56px, subtext at ~22px
	const scale = width / 400;
	const mainSize = Math.round(56 * scale);
	const subSize = Math.round(22 * scale);
	const letterSpacing = Math.round(4 * scale * 10) / 10;
	const paddingH = Math.round(24 * scale);
	const paddingV = Math.round(20 * scale);
	const gap = Math.round(6 * scale);

	// Explicit height — Satori ignores CSS shorthand for padding/gap,
	// so auto height under-calculates. Compute it explicitly.
	const height = paddingV * 2 + mainSize + gap + subSize;

	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width,
				height,
				backgroundColor: variant.bg,
				// Satori requires individual padding props — shorthand not supported
				paddingTop: paddingV,
				paddingBottom: paddingV,
				paddingLeft: paddingH,
				paddingRight: paddingH,
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							fontFamily: "Orbitron",
							fontWeight: 800,
							fontSize: mainSize,
							color: variant.text,
							marginBottom: gap,
						},
						children: "404",
					},
				},
				// "TECH FOUND" with strikethrough O.
				// Satori is flex-only: every child must have display:"flex".
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							fontFamily: "Orbitron",
							fontWeight: 500,
							fontSize: subSize,
							color: variant.subtext,
							letterSpacing,
						},
						children: [
							{
								type: "div",
								props: { style: { display: "flex" }, children: "TECH\u00A0F" },
							},
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										textDecoration: "line-through",
										textDecorationThickness: Math.max(1, Math.round(1.5 * scale)),
									},
									children: "O",
								},
							},
							{
								type: "div",
								props: { style: { display: "flex" }, children: "UND" },
							},
						],
					},
				},
			],
		},
	};
}

// Square canvas: logo scaled to ~70% of the side, centered with equal padding
function buildSquareLogoElement(variant: Variant, size: number) {
	const logoWidth = Math.round(size * 0.7);
	const logo = buildLogoElement(variant, logoWidth);
	const logoHeight = logo.props.style.height as number;

	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: size,
				height: size,
				backgroundColor: variant.bg,
			},
			children: [logo],
		},
	};
}

// ─── Render helpers ─────────────────────────────────────────────────────────

type SatoriElement =
	| ReturnType<typeof buildLogoElement>
	| ReturnType<typeof buildSquareLogoElement>;

async function renderSvg(
	element: SatoriElement,
	fonts: { name: string; data: ArrayBuffer; weight: number; style: string }[],
): Promise<string> {
	const { width, height } = element.props.style;
	return satori(element as Parameters<typeof satori>[0], {
		width: width as number,
		height: height as number,
		fonts,
		// @ts-ignore — embedFont ensures text is self-contained
		embedFont: true,
	});
}

// Render SVG at 4× target size, then scale down with resvg for antialiasing.
// The caller must pass an SVG built at targetWidth * 4.
async function svgToPng(svg: string, targetWidth: number): Promise<Uint8Array> {
	const resvg = new Resvg(svg, {
		fitTo: { mode: "width", value: targetWidth },
	});
	return resvg.render().asPng();
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
	console.log("Loading fonts...");
	const [font800, font500] = await Promise.all([
		loadFont("Orbitron", 800),
		loadFont("Orbitron", 500),
	]);

	const fonts = [
		{ name: "Orbitron", data: font800, weight: 800, style: "normal" },
		{ name: "Orbitron", data: font500, weight: 500, style: "normal" },
	];

	await mkdir(OUTPUT_DIR, { recursive: true });
	console.log(`Output: ${OUTPUT_DIR}\n`);

	for (const variant of VARIANTS) {
		console.log(`Variant: ${variant.name}`);

		// SVG (rectangular, high-res base)
		const svgElement = buildLogoElement(variant, 800);
		const svg = await renderSvg(svgElement, fonts);
		await writeFile(join(OUTPUT_DIR, `logo-${variant.name}.svg`), svg, "utf-8");
		console.log(`  ✓ logo-${variant.name}.svg`);

		// Rectangular PNGs — build at 4× then downscale for antialiasing
		for (const size of SIZES) {
			const element = buildLogoElement(variant, size * 4);
			const png = await svgToPng(await renderSvg(element, fonts), size);
			await writeFile(join(OUTPUT_DIR, `logo-${variant.name}-${size}.png`), png);
			console.log(`  ✓ logo-${variant.name}-${size}.png`);
		}

		// Square PNGs — build at 4× then downscale for antialiasing
		for (const size of SQUARE_SIZES) {
			const element = buildSquareLogoElement(variant, size * 4);
			const png = await svgToPng(await renderSvg(element, fonts), size);
			await writeFile(join(OUTPUT_DIR, `logo-${variant.name}-square-${size}.png`), png);
			console.log(`  ✓ logo-${variant.name}-square-${size}.png`);
		}
	}

	const total = VARIANTS.length * (1 + SIZES.length + SQUARE_SIZES.length);
	console.log(`\nDone — ${total} files written to public/brand/`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

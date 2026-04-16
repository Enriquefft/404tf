/**
 * Open Graph image generation for map.404tf.com.
 *
 * Renders 1200x630 PNGs with Satori (React-like VDOM → SVG) and resvg
 * (SVG → PNG). Fonts and color tokens are sourced from @404tf/brand, the
 * canonical brand package.
 */

import { readFile } from "node:fs/promises";
import { colors } from "@404tf/brand/tokens";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

export type OgKind = "landing" | "directorio" | "startup" | "insights";
export type OgLocale = "es" | "en";

export type OgParams = {
	kind: OgKind;
	locale: OgLocale;
	title?: string;
	subtitle?: string;
	metric?: string;
};

// ---- Fonts ----------------------------------------------------------------

// Static URLs so Vite/Astro trace and bundle the font files into the
// serverless function. Fonts live in apps/map/src/assets/ so the
// monorepo boundary is not crossed at runtime (Vercel nft cannot trace
// dynamic paths into sibling workspace packages).
const FONT_URLS = {
	display: new URL("../assets/fonts/BigShouldersDisplay-ExtraBold.ttf", import.meta.url),
	body: new URL("../assets/fonts/BarlowSemiCondensed-Regular.ttf", import.meta.url),
	bodyMedium: new URL("../assets/fonts/BarlowSemiCondensed-Medium.ttf", import.meta.url),
	mono: new URL("../assets/fonts/JetBrainsMono-Regular.ttf", import.meta.url),
} as const;

type LoadedFonts = {
	display: Buffer;
	body: Buffer;
	bodyMedium: Buffer;
	mono: Buffer;
};

let fontsPromise: Promise<LoadedFonts> | null = null;

function loadFonts(): Promise<LoadedFonts> {
	if (fontsPromise) return fontsPromise;
	fontsPromise = (async () => {
		const [display, body, bodyMedium, mono] = await Promise.all([
			readFile(FONT_URLS.display),
			readFile(FONT_URLS.body),
			readFile(FONT_URLS.bodyMedium),
			readFile(FONT_URLS.mono),
		]);
		return { display, body, bodyMedium, mono };
	})();
	return fontsPromise;
}

// ---- Copy (minimal, bilingual) --------------------------------------------

const COPY = {
	kicker: {
		es: "LATAM · DEEPTECH · INTELIGENCIA",
		en: "LATAM · DEEPTECH · INTELLIGENCE",
	},
	landingSubtitle: {
		es: "El directorio canónico de startups deeptech en LATAM.",
		en: "The canonical directory of deeptech startups in LATAM.",
	},
	landingHeadline: "404 MAPPED",
	directorioTitle: {
		es: "DIRECTORIO",
		en: "DIRECTORY",
	},
	directorioSubtitle: {
		es: "Filtra por vertical, madurez y país.",
		en: "Filter by vertical, maturity and country.",
	},
	insightsTitle: {
		es: "PERSPECTIVAS",
		en: "INSIGHTS",
	},
	insightsSubtitle: {
		es: "El estado del deeptech en LATAM.",
		en: "The state of deeptech in LATAM.",
	},
	browseLabel: {
		es: "EXPLORAR · STARTUPS",
		en: "BROWSE · STARTUPS",
	},
} as const;

// ---- VDOM helper (avoids JSX plumbing in .ts files) -----------------------

type VNode = {
	type: string;
	props: Record<string, unknown> & { children?: unknown };
};

function h(type: string, props: Record<string, unknown> | null, ...children: unknown[]): VNode {
	const flat: unknown[] = [];
	for (const c of children) {
		if (Array.isArray(c)) {
			for (const cc of c) flat.push(cc);
		} else if (c !== null && c !== undefined && c !== false) {
			flat.push(c);
		}
	}
	return {
		type,
		props: { ...(props ?? {}), children: flat.length === 1 ? flat[0] : flat },
	};
}

// ---- Style tokens ---------------------------------------------------------

const BG = colors.surface.dark.bg.hex; // near-black
const CARD = colors.surface.dark.card.hex;
const FG = colors.surface.dark.fg.hex;
const MUTED = "#8A8088";
const AMBER = colors.secondary.hex;

// ---- Template -------------------------------------------------------------

function buildScene(params: OgParams): VNode {
	const { kind, locale } = params;
	const kicker = COPY.kicker[locale];

	const titleText =
		params.title ??
		(kind === "landing"
			? COPY.landingHeadline
			: kind === "directorio"
				? COPY.directorioTitle[locale]
				: kind === "insights"
					? COPY.insightsTitle[locale]
					: "404 MAPPED");

	const subtitleText =
		params.subtitle ??
		(kind === "landing"
			? COPY.landingSubtitle[locale]
			: kind === "directorio"
				? COPY.directorioSubtitle[locale]
				: kind === "insights"
					? COPY.insightsSubtitle[locale]
					: "");

	// Render "404" in amber for landing only
	const isLanding = kind === "landing" && !params.title;

	const titleNode: VNode = isLanding
		? h(
				"div",
				{
					style: {
						display: "flex",
						fontFamily: "Display",
						fontSize: 168,
						lineHeight: 0.9,
						letterSpacing: "-0.02em",
						color: FG,
					},
				},
				h("span", { style: { color: AMBER } }, "404"),
				h("span", { style: { marginLeft: 24 } }, "MAPPED"),
			)
		: h(
				"div",
				{
					style: {
						display: "flex",
						fontFamily: "Display",
						fontSize: titleText.length > 24 ? 96 : 132,
						lineHeight: 0.95,
						letterSpacing: "-0.02em",
						color: FG,
						maxWidth: 720,
						// Allow wrap
						flexWrap: "wrap",
					},
				},
				titleText,
			);

	const rightColumn = buildRightColumn(params);

	return h(
		"div",
		{
			style: {
				width: 1200,
				height: 630,
				display: "flex",
				flexDirection: "row",
				background: BG,
				fontFamily: "Body",
				color: FG,
			},
		},
		// Left 2/3
		h(
			"div",
			{
				style: {
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "72px 64px",
					width: 800,
					height: 630,
				},
			},
			h(
				"div",
				{
					style: {
						display: "flex",
						fontFamily: "Mono",
						fontSize: 22,
						color: AMBER,
						letterSpacing: "0.18em",
					},
				},
				kicker,
			),
			h(
				"div",
				{
					style: {
						display: "flex",
						flexDirection: "column",
						gap: 28,
						marginTop: 24,
						marginBottom: 24,
					},
				},
				titleNode,
				subtitleText
					? h(
							"div",
							{
								style: {
									display: "flex",
									fontFamily: "BodyMedium",
									fontSize: 30,
									color: MUTED,
									maxWidth: 680,
									lineHeight: 1.25,
								},
							},
							subtitleText,
						)
					: null,
			),
			h(
				"div",
				{
					style: {
						display: "flex",
						fontFamily: "Mono",
						fontSize: 20,
						color: MUTED,
						letterSpacing: "0.1em",
					},
				},
				"map.404tf.com",
			),
		),
		// Right 1/3
		rightColumn,
	);
}

function buildRightColumn(params: OgParams): VNode {
	const { kind, locale } = params;

	const ruleStyle = {
		display: "flex",
		width: 2,
		height: 486,
		background: AMBER,
		marginTop: 72,
	} as const;

	// Choose the right content per kind
	let content: VNode;

	if (kind === "landing") {
		content = h(
			"div",
			{
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 28,
				},
			},
			buildStat("50+", locale === "es" ? "STARTUPS" : "STARTUPS"),
			buildStat("7", locale === "es" ? "PAÍSES" : "COUNTRIES"),
			buildStat("$482.8M", locale === "es" ? "CAPITAL MAPEADO" : "CAPITAL MAPPED"),
		);
	} else if (kind === "directorio") {
		content = h(
			"div",
			{
				style: {
					display: "flex",
					fontFamily: "Mono",
					fontSize: 22,
					color: AMBER,
					letterSpacing: "0.14em",
					maxWidth: 300,
					lineHeight: 1.4,
				},
			},
			COPY.browseLabel[locale],
		);
	} else if (kind === "insights") {
		content = h(
			"div",
			{
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 12,
				},
			},
			h(
				"div",
				{
					style: {
						display: "flex",
						fontFamily: "Display",
						fontSize: 144,
						color: AMBER,
						lineHeight: 0.9,
						letterSpacing: "-0.02em",
					},
				},
				params.metric ?? "50+",
			),
			h(
				"div",
				{
					style: {
						display: "flex",
						fontFamily: "Mono",
						fontSize: 18,
						color: MUTED,
						letterSpacing: "0.14em",
					},
				},
				locale === "es" ? "STARTUPS MAPEADAS" : "STARTUPS MAPPED",
			),
		);
	} else {
		// startup
		content = h(
			"div",
			{
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 16,
				},
			},
			h(
				"div",
				{
					style: {
						display: "flex",
						background: CARD,
						border: `2px solid ${AMBER}`,
						color: AMBER,
						fontFamily: "Mono",
						fontSize: 20,
						letterSpacing: "0.12em",
						padding: "12px 18px",
					},
				},
				(params.metric ?? "LATAM").toUpperCase(),
			),
		);
	}

	return h(
		"div",
		{
			style: {
				display: "flex",
				flexDirection: "row",
				width: 400,
				height: 630,
			},
		},
		h("div", { style: ruleStyle }),
		h(
			"div",
			{
				style: {
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "72px 48px",
					flex: 1,
				},
			},
			content,
		),
	);
}

function buildStat(value: string, label: string): VNode {
	return h(
		"div",
		{ style: { display: "flex", flexDirection: "column", gap: 4 } },
		h(
			"div",
			{
				style: {
					display: "flex",
					fontFamily: "Display",
					fontSize: 72,
					color: AMBER,
					lineHeight: 1,
					letterSpacing: "-0.02em",
				},
			},
			value,
		),
		h(
			"div",
			{
				style: {
					display: "flex",
					fontFamily: "Mono",
					fontSize: 16,
					color: MUTED,
					letterSpacing: "0.14em",
				},
			},
			label,
		),
	);
}

// ---- Public API -----------------------------------------------------------

export async function renderOgImage(params: OgParams): Promise<Buffer> {
	const fonts = await loadFonts();
	const scene = buildScene(params);

	// Satori accepts a subset of React VDOM; our plain object matches it.
	const svg = await satori(scene as unknown as Parameters<typeof satori>[0], {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Display", data: fonts.display, weight: 800, style: "normal" },
			{ name: "Body", data: fonts.body, weight: 400, style: "normal" },
			{
				name: "BodyMedium",
				data: fonts.bodyMedium,
				weight: 500,
				style: "normal",
			},
			{ name: "Mono", data: fonts.mono, weight: 400, style: "normal" },
		],
	});

	const png = new Resvg(svg, {
		fitTo: { mode: "width", value: 1200 },
	})
		.render()
		.asPng();

	return Buffer.from(png);
}

/**
 * Logo system configuration — logomark, wordmark, lockup.
 * Used by the export script and OG image generation.
 *
 * Colors reference tokens.ts (single source of truth).
 */

import { colors } from "./tokens.ts";

// ─── Wordmark ────────────────────────────────────────────────────────────────

export const wordmark = {
	lines: [
		{ text: "404", weight: 800 as const },
		{ text: "TECH FOUND", weight: 500 as const },
	],
	font: "Big Shoulders Display",
	strikethroughChar: "O",
} as const;

// ─── Logomark ────────────────────────────────────────────────────────────────
// 4 marks for different contexts, all using "404" with struck zero.
// Generated via: bun run packages/brand/scripts/export-logomark.ts
// Output: assets/logos/generated/marks/

export const logomark = {
	status: "complete" as const,
	marks: {
		/** Primary logomark — purple 4s, amber 0, purple strike. Default mark. */
		duotone: { name: "duotone", role: "Primary logomark" },
		/** Favicon — amber 404, purple strike. High contrast at tiny sizes. */
		amber: { name: "amber", role: "Favicon" },
		/** Social avatar — purple bg, dark 404, amber strike. Pops on any surface. */
		negative: { name: "negative", role: "Social avatar" },
		/** Full lockup — amber 404 + TECH FOUND. Complete identity. */
		stacked: { name: "stacked", role: "Full lockup" },
	},
} as const;

// ─── Lockup ──────────────────────────────────────────────────────────────────
// Stacked mark serves as the lockup (404 + TECH FOUND in one square).
// Horizontal lockup uses Logo.tsx component in the landing app.

export const lockup = {
	status: "complete" as const,
	orientations: ["horizontal", "vertical"] as const,
};

// ─── Color variants ──────────────────────────────────────────────────────────

export type LogoVariant = {
	name: string;
	bg: string;
	text: string;
	subtext: string;
};

export const logoVariants: LogoVariant[] = [
	{
		name: "dark",
		bg: colors.surface.dark.bg.hex,
		text: colors.surface.dark.fg.hex,
		subtext: colors.surface.dark.muted.hex,
	},
	{
		name: "light",
		bg: colors.surface.light.bg.hex,
		text: colors.surface.light.fg.hex,
		subtext: colors.surface.light.muted.hex,
	},
	{
		name: "transparent-ondark",
		bg: "transparent",
		text: colors.surface.dark.fg.hex,
		subtext: colors.surface.dark.muted.hex,
	},
	{
		name: "transparent-onlight",
		bg: "transparent",
		text: colors.surface.light.fg.hex,
		subtext: colors.surface.light.muted.hex,
	},
];

// ─── Export sizes ────────────────────────────────────────────────────────────

export const logoSizes = {
	rectangular: [64, 128, 256, 512, 1024, 1200],
	square: [16, 32, 64, 128, 256, 512, 1024],
} as const;

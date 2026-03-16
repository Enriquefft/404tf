/**
 * Logo/wordmark configuration — layout, variants, and export sizes.
 * Used by the export script and potentially by OG image generation.
 */

export const wordmark = {
	lines: [
		{ text: "404", weight: 800 as const },
		{ text: "TECH FOUND", weight: 500 as const },
	],
	font: "Orbitron",
	strikethroughChar: "O",
} as const;

export type LogoVariant = {
	name: string;
	bg: string;
	text: string;
	subtext: string;
};

export const logoVariants: LogoVariant[] = [
	{
		name: "dark",
		bg: "#121212",
		text: "#fafafa",
		subtext: "#a3a3a3",
	},
	{
		name: "light",
		bg: "#ffffff",
		text: "#1a1a1a",
		subtext: "#6b6b6b",
	},
	{
		name: "transparent-ondark",
		bg: "transparent",
		text: "#fafafa",
		subtext: "#a3a3a3",
	},
	{
		name: "transparent-onlight",
		bg: "transparent",
		text: "#1a1a1a",
		subtext: "#6b6b6b",
	},
];

export const logoSizes = {
	rectangular: [64, 128, 256, 512, 1024, 1200],
	square: [16, 32, 64, 128, 256, 512, 1024],
} as const;

export const logomark = {
	status: "pending-design" as const,
};

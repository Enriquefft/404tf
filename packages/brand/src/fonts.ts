/**
 * Canonical font declarations for 404 Tech Found.
 * Metadata only — web apps use next/font/google or @font-face as needed.
 * The local TTF files in assets/fonts/ are used by the export script.
 */

export const fonts = {
	display: {
		family: "Orbitron",
		weights: [500, 600, 700, 800],
		category: "display" as const,
		fallback: "system-ui, sans-serif",
	},
	body: {
		family: "Inter",
		weights: [400, 500, 600],
		category: "sans-serif" as const,
		fallback:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif',
	},
	code: {
		family: "JetBrains Mono",
		weights: [400],
		category: "monospace" as const,
		fallback: "Consolas, Monaco, monospace",
	},
} as const;

export type FontToken = typeof fonts;

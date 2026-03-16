/**
 * Brand color tokens — single source of truth for all 404 Tech Found colors.
 *
 * OKLCH is the primary format (perceptually uniform, Tailwind v4 native).
 * Hex is provided for non-CSS contexts (export scripts, OG images, Figma).
 *
 * Source: content_unorganized/brand.md (Brand Book v1.0)
 */

export const colors = {
	primary: {
		oklch: "0.48 0.27 285",
		hex: "#5E17EB",
	},
	secondary: {
		oklch: "0.60 0.24 293",
		hex: "#8C52FF",
	},
	houses: {
		ai: {
			oklch: "0.73 0.21 346",
			hex: "#FF66C4",
		},
		biotech: {
			oklch: "0.70 0.18 152",
			hex: "#00BF63",
		},
		hardware: {
			oklch: "0.82 0.17 79",
			hex: "#FFB400",
		},
		space: {
			oklch: "0.74 0.15 240",
			hex: "#38B6FF",
		},
	},
	surface: {
		dark: {
			bg: { oklch: "0.18 0 0", hex: "#111111" },
			fg: { oklch: "0.99 0 0", hex: "#FAFAFA" },
			muted: { oklch: "0.55 0 0", hex: "#6b6b6b" },
		},
		light: {
			bg: { oklch: "0.99 0 0", hex: "#FAFAFA" },
			fg: { oklch: "0.18 0 0", hex: "#111111" },
			muted: { oklch: "0.55 0 0", hex: "#6b6b6b" },
		},
	},
	destructive: {
		oklch: "0.64 0.21 25",
		hex: "#f24545",
	},
} as const;

export type ColorToken = typeof colors;

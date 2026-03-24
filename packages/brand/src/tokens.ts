/**
 * Brand color tokens — single source of truth for all 404 Tech Found colors.
 *
 * Direction: Foundry (Proposal T) — warm red-violet purple primary,
 * forge amber secondary, 4 programme houses, brutalist (0 radius).
 *
 * OKLCH is the primary format (perceptually uniform, Tailwind v4 native).
 * Hex is provided for non-CSS contexts (export scripts, OG images, Figma).
 *
 * Source: packages/brand/proposals/src/styles/global.css [data-theme="foundry"]
 */

export const colors = {
	primary: {
		oklch: "0.53 0.24 305",
		hex: "#8E2CD7",
	},
	secondary: {
		oklch: "0.72 0.18 55",
		hex: "#F77F00",
	},
	accent: {
		oklch: "0.16 0.035 310",
		hex: "#120918",
	},
	ring: {
		oklch: "0.58 0.22 305",
		hex: "#9A49E0",
	},
	houses: {
		ai: {
			oklch: "0.68 0.26 358",
			hex: "#FF2898",
		},
		biotech: {
			oklch: "0.73 0.23 150",
			hex: "#00CD4E",
		},
		hardware: {
			oklch: "0.68 0.23 30",
			hex: "#FF4834",
		},
		space: {
			oklch: "0.65 0.20 230",
			hex: "#00A0F0",
		},
	},
	surface: {
		dark: {
			bg: { oklch: "0.07 0.020 315", hex: "#0F080F" },
			fg: { oklch: "0.92 0.008 55", hex: "#EDE8E0" },
			card: { oklch: "0.11 0.028 312", hex: "#1A0E1C" },
			muted: { oklch: "0.52 0.018 315", hex: "#766878" },
		},
		light: {
			bg: { oklch: "0.975 0.006 85", hex: "#FAF8F3" },
			fg: { oklch: "0.18 0.09 280", hex: "#2D1856" },
			card: { oklch: "0.94 0.015 275", hex: "#E8E0F0" },
			muted: { oklch: "0.38 0.07 280", hex: "#504068" },
		},
	},
	destructive: {
		oklch: "0.55 0.22 27",
		hex: "#D83030",
	},
} as const;

export type ColorToken = typeof colors;

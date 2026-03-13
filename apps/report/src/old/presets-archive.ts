/**
 * PRESETS ARCHIVE — Historical reference only
 * ============================================
 * This file captures all explored variant combinations from the design system
 * exploration phase. Preset #2 (Deep Plum + Bricolage Grotesque + Brand Purple)
 * was chosen and baked into the active design system.
 *
 * NOT imported by active code.
 */

// ---------------------------------------------------------------------------
// Background Variants (5 explored)
// ---------------------------------------------------------------------------
export const BG_VARIANTS = [
	{
		id: "original",
		label: "Original",
		vars: {
			"--bg-deep": "#080B16",
			"--bg-surface": "#0F1320",
			"--bg-elevated": "#171C2E",
			"--bg-overlay": "#1E2438",
			"--text-secondary": "#8B92A8",
			"--text-tertiary": "#5C6378",
			"--text-disabled": "#3D4356",
			"--secondary": "#3DA5D9",
		},
	},
	{
		id: "warm-charcoal",
		label: "Warm Charcoal",
		vars: {
			"--bg-deep": "#0C0A08",
			"--bg-surface": "#151210",
			"--bg-elevated": "#1E1A17",
			"--bg-overlay": "#272220",
			"--text-secondary": "#9B9088",
			"--text-tertiary": "#6B5F57",
			"--text-disabled": "#483E38",
			"--secondary": "#7BA38A",
		},
	},
	{
		id: "olive",
		label: "Olive",
		vars: {
			"--bg-deep": "#050504",
			"--bg-surface": "#0E0F0B",
			"--bg-elevated": "#181A15",
			"--bg-overlay": "#22241E",
			"--text-secondary": "#8B9282",
			"--text-tertiary": "#5C6354",
			"--text-disabled": "#3D4336",
			"--secondary": "#6BA38A",
		},
	},
	{
		id: "plum",
		label: "Deep Plum ★ CHOSEN",
		vars: {
			"--bg-deep": "#0A0710",
			"--bg-surface": "#110E18",
			"--bg-elevated": "#1A1622",
			"--bg-overlay": "#231E2D",
			"--text-secondary": "#928BA8",
			"--text-tertiary": "#635C78",
			"--text-disabled": "#433D56",
			"--secondary": "#9B8BCA",
		},
	},
	{
		id: "ink",
		label: "Ink Black",
		vars: {
			"--bg-deep": "#080808",
			"--bg-surface": "#111111",
			"--bg-elevated": "#1A1A1A",
			"--bg-overlay": "#232323",
			"--text-secondary": "#909090",
			"--text-tertiary": "#606060",
			"--text-disabled": "#404040",
			"--secondary": "#8CA0B0",
		},
	},
] as const;

// ---------------------------------------------------------------------------
// Font Variants (7 explored)
// ---------------------------------------------------------------------------
export const FONT_VARIANTS = [
	{
		id: "original",
		label: "Instrument Serif",
		family: "'Instrument Serif', Georgia, serif",
		displayStyle: "italic",
		displayWeight: "400",
	},
	{
		id: "syne",
		label: "Syne",
		family: "'Syne', Arial, sans-serif",
		displayStyle: "normal",
		displayWeight: "700",
	},
	{
		id: "bricolage",
		label: "Bricolage Grotesque ★ CHOSEN",
		family: "'Bricolage Grotesque', Arial, sans-serif",
		displayStyle: "normal",
		displayWeight: "600",
	},
	{
		id: "bebas",
		label: "Bebas Neue",
		family: "'Bebas Neue', Impact, sans-serif",
		displayStyle: "normal",
		displayWeight: "400",
	},
	{
		id: "playfair",
		label: "Playfair Display",
		family: "'Playfair Display', Georgia, serif",
		displayStyle: "italic",
		displayWeight: "400",
	},
	{
		id: "familjen",
		label: "Familjen Grotesk",
		family: "'Familjen Grotesk', Arial, sans-serif",
		displayStyle: "normal",
		displayWeight: "600",
	},
	{
		id: "outfit",
		label: "Outfit",
		family: "'Outfit', Arial, sans-serif",
		displayStyle: "normal",
		displayWeight: "600",
	},
] as const;

// ---------------------------------------------------------------------------
// Accent Variants (6 explored)
// ---------------------------------------------------------------------------
export const ACCENT_VARIANTS = [
	{
		id: "gold",
		label: "Gold",
		swatch: "#EDAE49",
		base: "#EDAE49",
		light: "#F0BF5A",
		dark: "#8C6316",
		darker: "#45310C",
		rgb: [237, 174, 73],
	},
	{
		id: "purple",
		label: "Brand Purple ★ CHOSEN",
		swatch: "#7C3AED",
		base: "#7C3AED",
		light: "#9B5BFF",
		dark: "#5B21B6",
		darker: "#2E1065",
		rgb: [124, 58, 237],
	},
	{
		id: "copper",
		label: "Copper",
		swatch: "#C8802A",
		base: "#C8802A",
		light: "#DDA04E",
		dark: "#8B5A1B",
		darker: "#3D2508",
		rgb: [200, 128, 42],
	},
	{
		id: "emerald",
		label: "Emerald",
		swatch: "#10B981",
		base: "#10B981",
		light: "#34D399",
		dark: "#047857",
		darker: "#022C22",
		rgb: [16, 185, 129],
	},
	{
		id: "crimson",
		label: "Crimson",
		swatch: "#EF4444",
		base: "#EF4444",
		light: "#F87171",
		dark: "#991B1B",
		darker: "#450A0A",
		rgb: [239, 68, 68],
	},
	{
		id: "frost",
		label: "Frost",
		swatch: "#38BDF8",
		base: "#38BDF8",
		light: "#7DD3FC",
		dark: "#0369A1",
		darker: "#082F49",
		rgb: [56, 189, 248],
	},
] as const;

// ---------------------------------------------------------------------------
// Top 5 Preset Combinations
// ---------------------------------------------------------------------------
export const PRESETS = [
	{ label: "#1 Charcoal + Syne + Copper", bg: "warm-charcoal", font: "syne", accent: "copper" },
	{ label: "#2 Plum + Bricolage + Purple ★ CHOSEN", bg: "plum", font: "bricolage", accent: "purple" },
	{ label: "#3 Ink + Bebas + Frost", bg: "ink", font: "bebas", accent: "frost" },
	{ label: "#4 Olive + Familjen + Emerald", bg: "olive", font: "familjen", accent: "emerald" },
	{ label: "#5 Charcoal + Bricolage + Gold", bg: "warm-charcoal", font: "bricolage", accent: "gold" },
] as const;

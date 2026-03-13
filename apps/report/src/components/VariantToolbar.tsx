import { useState } from "react";

const BG_VARIANTS = [
	{ id: "original", label: "Original", vars: {} },
	{
		id: "warm-charcoal",
		label: "Warm Charcoal",
		vars: {
			"--bg-deep": "#0C0A08",
			"--bg-surface": "#151210",
			"--bg-elevated": "#1E1A17",
			"--bg-overlay": "#272220",
			// warm-shifted text tones
			"--text-secondary": "#9B9088",
			"--text-tertiary": "#6B5F57",
			"--text-disabled": "#483E38",
			// warm steel
			"--secondary": "#C89B7A",
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
			// olive-shifted text tones
			"--text-secondary": "#8B9282",
			"--text-tertiary": "#5C6354",
			"--text-disabled": "#3D4336",
			// sage steel
			"--secondary": "#6BA38A",
		},
	},
	{
		id: "plum",
		label: "Deep Plum",
		vars: {
			"--bg-deep": "#0A0710",
			"--bg-surface": "#110E18",
			"--bg-elevated": "#1A1622",
			"--bg-overlay": "#231E2D",
			// purple-shifted text tones
			"--text-secondary": "#928BA8",
			"--text-tertiary": "#635C78",
			"--text-disabled": "#433D56",
			// lavender steel
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
			// pure neutral text tones
			"--text-secondary": "#909090",
			"--text-tertiary": "#606060",
			"--text-disabled": "#404040",
			// neutral steel
			"--secondary": "#8CA0B0",
		},
	},
] as const;

const FONT_VARIANTS = [
	{ id: "original", label: "Instrument Serif", css: "" },
	{
		id: "syne",
		label: "Syne",
		css: "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');",
		family: "'Syne', Arial, sans-serif",
	},
	{
		id: "bricolage",
		label: "Bricolage Grotesque",
		css: "@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap');",
		family: "'Bricolage Grotesque', Arial, sans-serif",
	},
	{
		id: "bebas",
		label: "Bebas Neue",
		css: "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');",
		family: "'Bebas Neue', Impact, sans-serif",
	},
	{
		id: "playfair",
		label: "Playfair Display",
		css: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');",
		family: "'Playfair Display', Georgia, serif",
	},
	{
		id: "familjen",
		label: "Familjen Grotesk",
		css: "@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:ital,wght@0,400..700;1,400..700&display=swap');",
		family: "'Familjen Grotesk', Arial, sans-serif",
	},
	{
		id: "outfit",
		label: "Outfit",
		css: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');",
		family: "'Outfit', Arial, sans-serif",
	},
] as const;

type AccentPalette = {
	"--accent": string;
	"--accent-light": string;
	"--accent-dark": string;
	"--accent-darker": string;
	"--accent-4": string;
	"--accent-8": string;
	"--accent-10": string;
	"--accent-15": string;
	"--accent-25": string;
	"--accent-30": string;
	"--accent-40": string;
	"--accent-60": string;
};

function accentScale(base: string, light: string, dark: string, darker: string, r: number, g: number, b: number): AccentPalette {
	return {
		"--accent": base,
		"--accent-light": light,
		"--accent-dark": dark,
		"--accent-darker": darker,
		"--accent-4": `rgba(${r},${g},${b},0.04)`,
		"--accent-8": `rgba(${r},${g},${b},0.08)`,
		"--accent-10": `rgba(${r},${g},${b},0.10)`,
		"--accent-15": `rgba(${r},${g},${b},0.15)`,
		"--accent-25": `rgba(${r},${g},${b},0.25)`,
		"--accent-30": `rgba(${r},${g},${b},0.30)`,
		"--accent-40": `rgba(${r},${g},${b},0.40)`,
		"--accent-60": `rgba(${r},${g},${b},0.60)`,
	};
}

const ACCENT_VARIANTS: { id: string; label: string; swatch: string; vars: AccentPalette }[] = [
	{
		id: "gold",
		label: "Gold",
		swatch: "#EDAE49",
		vars: accentScale("#EDAE49", "#F0BF5A", "#8C6316", "#45310C", 237, 174, 73),
	},
	{
		id: "purple",
		label: "Brand Purple",
		swatch: "#7C3AED",
		vars: accentScale("#7C3AED", "#9B5BFF", "#5B21B6", "#2E1065", 124, 58, 237),
	},
	{
		id: "copper",
		label: "Copper",
		swatch: "#D97706",
		vars: accentScale("#D97706", "#F59E0B", "#92400E", "#451A03", 217, 119, 6),
	},
	{
		id: "emerald",
		label: "Emerald",
		swatch: "#10B981",
		vars: accentScale("#10B981", "#34D399", "#047857", "#022C22", 16, 185, 129),
	},
	{
		id: "crimson",
		label: "Crimson",
		swatch: "#EF4444",
		vars: accentScale("#EF4444", "#F87171", "#991B1B", "#450A0A", 239, 68, 68),
	},
	{
		id: "frost",
		label: "Frost",
		swatch: "#38BDF8",
		vars: accentScale("#38BDF8", "#7DD3FC", "#0369A1", "#082F49", 56, 189, 248),
	},
];

const ORIGINAL_BG: Record<string, string> = {
	"--bg-deep": "#080B16",
	"--bg-surface": "#0F1320",
	"--bg-elevated": "#171C2E",
	"--bg-overlay": "#1E2438",
	"--text-secondary": "#8B92A8",
	"--text-tertiary": "#5C6378",
	"--text-disabled": "#3D4356",
	"--secondary": "#3DA5D9",
};

const ORIGINAL_FONT = "'Instrument Serif', Georgia, serif";

export function VariantToolbar() {
	const [activeBg, setActiveBg] = useState("original");
	const [activeFont, setActiveFont] = useState("original");
	const [activeAccent, setActiveAccent] = useState("gold");

	function applyVars(vars: Record<string, string>) {
		const root = document.querySelector(".ds-root") as HTMLElement | null;
		if (!root) return;
		for (const [key, value] of Object.entries(vars)) {
			root.style.setProperty(key, value);
		}
	}

	function applyBg(id: string) {
		setActiveBg(id);
		const variant = BG_VARIANTS.find((v) => v.id === id);
		const vars = id === "original" ? ORIGINAL_BG : variant?.vars ?? {};
		applyVars(vars as Record<string, string>);
	}

	function applyFont(id: string) {
		setActiveFont(id);
		const root = document.querySelector(".ds-root") as HTMLElement | null;
		if (!root) return;
		const variant = FONT_VARIANTS.find((v) => v.id === id);

		if (variant && "css" in variant && variant.css) {
			let styleEl = document.getElementById("variant-font-import");
			if (!styleEl) {
				styleEl = document.createElement("style");
				styleEl.id = "variant-font-import";
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = variant.css;
		}

		const family =
			id === "original"
				? ORIGINAL_FONT
				: (variant && "family" in variant ? variant.family : null) ?? ORIGINAL_FONT;
		root.style.setProperty("--font-display", family);
	}

	function applyAccent(id: string) {
		setActiveAccent(id);
		const variant = ACCENT_VARIANTS.find((v) => v.id === id);
		if (variant) applyVars(variant.vars);
	}

	function applyPreset(bg: string, font: string, accent: string) {
		applyBg(bg);
		applyFont(font);
		applyAccent(accent);
	}

	const PRESETS = [
		{ label: "#1 Charcoal + Syne + Copper", bg: "warm-charcoal", font: "syne", accent: "copper" },
		{ label: "#2 Plum + Bricolage + Purple", bg: "plum", font: "bricolage", accent: "purple" },
		{ label: "#3 Ink + Bebas + Frost", bg: "ink", font: "bebas", accent: "frost" },
		{ label: "#4 Olive + Familjen + Emerald", bg: "olive", font: "familjen", accent: "emerald" },
		{ label: "#5 Charcoal + Bricolage + Gold", bg: "warm-charcoal", font: "bricolage", accent: "gold" },
	];

	const pill = (
		isActive: boolean,
	): React.CSSProperties => ({
		padding: "0.25rem 0.5rem",
		borderRadius: "4px",
		border: "none",
		cursor: "pointer",
		fontFamily: "'JetBrains Mono', monospace",
		fontSize: "0.625rem",
		fontWeight: isActive ? 600 : 400,
		color: isActive ? "#080B16" : "#8B92A8",
		background: isActive ? "#EDAE49" : "rgba(255,255,255,0.06)",
		transition: "all 120ms ease-out",
	});

	const rowLabel: React.CSSProperties = {
		fontFamily: "'JetBrains Mono', monospace",
		fontSize: "0.5625rem",
		color: "#5C6378",
		textTransform: "uppercase",
		letterSpacing: "0.08em",
		width: "2.5rem",
		flexShrink: 0,
	};

	const row: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		gap: "0.375rem",
		flexWrap: "wrap",
	};

	return (
		<div
			style={{
				position: "fixed",
				top: "0.75rem",
				right: "0.75rem",
				zIndex: 50,
				display: "flex",
				flexDirection: "column",
				gap: "0.375rem",
				background: "rgba(8,11,22,0.92)",
				backdropFilter: "blur(12px)",
				border: "1px solid rgba(255,255,255,0.08)",
				borderRadius: "8px",
				padding: "0.625rem",
				maxWidth: "min(480px, 50vw)",
			}}
		>
			<div style={row}>
				<span style={rowLabel}>Top 5</span>
				{PRESETS.map((p) => (
					<button
						key={p.label}
						type="button"
						onClick={() => applyPreset(p.bg, p.font, p.accent)}
						style={{
							...pill(activeBg === p.bg && activeFont === p.font && activeAccent === p.accent),
							fontSize: "0.5625rem",
						}}
					>
						{p.label}
					</button>
				))}
			</div>
			<div
				style={{
					height: "1px",
					background: "rgba(255,255,255,0.06)",
					margin: "0.125rem 0",
				}}
			/>
			<div style={row}>
				<span style={rowLabel}>BG</span>
				{BG_VARIANTS.map((v) => (
					<button
						key={v.id}
						type="button"
						onClick={() => applyBg(v.id)}
						style={pill(activeBg === v.id)}
					>
						{v.label}
					</button>
				))}
			</div>
			<div style={row}>
				<span style={rowLabel}>Font</span>
				{FONT_VARIANTS.map((v) => (
					<button
						key={v.id}
						type="button"
						onClick={() => applyFont(v.id)}
						style={pill(activeFont === v.id)}
					>
						{v.label}
					</button>
				))}
			</div>
			<div style={row}>
				<span style={rowLabel}>Accent</span>
				{ACCENT_VARIANTS.map((v) => (
					<button
						key={v.id}
						type="button"
						onClick={() => applyAccent(v.id)}
						style={{
							...pill(activeAccent === v.id),
							display: "inline-flex",
							alignItems: "center",
							gap: "0.25rem",
						}}
					>
						<span
							style={{
								display: "inline-block",
								width: "0.5rem",
								height: "0.5rem",
								borderRadius: "50%",
								background: v.swatch,
								flexShrink: 0,
							}}
						/>
						{v.label}
					</button>
				))}
			</div>
		</div>
	);
}

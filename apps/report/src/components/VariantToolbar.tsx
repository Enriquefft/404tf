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

const ORIGINAL_BG = {
	"--bg-deep": "#080B16",
	"--bg-surface": "#0F1320",
	"--bg-elevated": "#171C2E",
	"--bg-overlay": "#1E2438",
};

const ORIGINAL_FONT =
	"'Instrument Serif', Georgia, serif";

export function VariantToolbar() {
	const [activeBg, setActiveBg] = useState("original");
	const [activeFont, setActiveFont] = useState("original");

	function applyBg(id: string) {
		setActiveBg(id);
		const root = document.querySelector(".ds-root") as HTMLElement | null;
		if (!root) return;
		const variant = BG_VARIANTS.find((v) => v.id === id);
		const vars = id === "original" ? ORIGINAL_BG : variant?.vars ?? {};
		for (const [key, value] of Object.entries(vars) as [string, string][]) {
			root.style.setProperty(key, value);
		}
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
				maxWidth: "min(420px, 45vw)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
				<span
					style={{
						fontFamily: "'JetBrains Mono', monospace",
						fontSize: "0.5625rem",
						color: "#5C6378",
						textTransform: "uppercase",
						letterSpacing: "0.08em",
						width: "1.5rem",
					}}
				>
					BG
				</span>
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
			<div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
				<span
					style={{
						fontFamily: "'JetBrains Mono', monospace",
						fontSize: "0.5625rem",
						color: "#5C6378",
						textTransform: "uppercase",
						letterSpacing: "0.08em",
						width: "1.5rem",
					}}
				>
					Font
				</span>
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
		</div>
	);
}

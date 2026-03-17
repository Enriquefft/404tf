import { useState, useEffect } from "react";

const themes = [
	{ id: "signal", label: "Signal", color: "#FF5C00", gen: "A" },
	{ id: "phosphor", label: "Phosphor", color: "#BFFF00", gen: "B" },
	{ id: "anomaly", label: "Anomaly", color: "#FF0080", gen: "C" },
	{ id: "monolith", label: "Monolith", color: "#0055FF", gen: "D" },
	{ id: "extremophile", label: "Extremophile", color: "#00E5C8", gen: "E" },
	{ id: "helio", label: "Helio", color: "#4F46E5", gen: "F" },
	{ id: "obsidian", label: "Obsidian", color: "#DC2626", gen: "G" },
	{ id: "tectonic", label: "Tectonic", color: "#C05A34", gen: "H" },
	{ id: "biolume", label: "Biolume", color: "#3BA8D4", gen: "I" },
	{ id: "cortex", label: "Cortex", color: "#1C6B4C", gen: "J" },
	{ id: "vulcan", label: "Vulcan", color: "#E88420", gen: "K" },
	{ id: "codex", label: "Codex", color: "#C8A530", gen: "L" },
	{ id: "static", label: "Static", color: "#E8D000", gen: "M" },
	{ id: "evolved", label: "Evolved", color: "#7C3AED", gen: "N" },
	{ id: "forge", label: "Forge", color: "#D49420", gen: "O" },
	{ id: "litho", label: "Litho", color: "#2D1856", gen: "P" },
] as const;

export function ThemeSwitcher() {
	const [active, setActive] = useState("signal");

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", active);
	}, [active]);

	return (
		<nav
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				zIndex: 100,
				display: "flex",
				alignItems: "center",
				gap: "1px",
				padding: "6px 8px",
				background: "rgba(0,0,0,0.92)",
				backdropFilter: "blur(12px)",
				borderBottom: "1px solid rgba(255,255,255,0.06)",
				overflowX: "auto",
				WebkitOverflowScrolling: "touch",
			}}
		>
			<span
				style={{
					fontSize: "9px",
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					color: "rgba(255,255,255,0.3)",
					marginRight: "8px",
					fontFamily: "system-ui",
					whiteSpace: "nowrap",
					flexShrink: 0,
				}}
			>
				404 Brand
			</span>
			{themes.map((t) => (
				<button
					key={t.id}
					onClick={() => setActive(t.id)}
					title={`${t.gen}: ${t.label}`}
					style={{
						padding: "4px 7px",
						fontSize: "11px",
						fontFamily: "system-ui",
						fontWeight: active === t.id ? 600 : 400,
						color: active === t.id ? t.color : "rgba(255,255,255,0.4)",
						background:
							active === t.id ? "rgba(255,255,255,0.07)" : "transparent",
						border:
							active === t.id
								? `1px solid ${t.color}35`
								: "1px solid transparent",
						borderRadius: "4px",
						cursor: "pointer",
						transition: "all 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
						whiteSpace: "nowrap",
						flexShrink: 0,
						display: "flex",
						alignItems: "center",
						gap: "4px",
					}}
				>
					<span
						style={{
							display: "block",
							width: "5px",
							height: "5px",
							borderRadius: "50%",
							backgroundColor: t.color,
							opacity: active === t.id ? 1 : 0.3,
							flexShrink: 0,
						}}
					/>
					{t.label}
				</button>
			))}
		</nav>
	);
}

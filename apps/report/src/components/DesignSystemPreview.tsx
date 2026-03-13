import { AltArrowDown, AltArrowUp, Magnifier } from "@solar-icons/react";
import { type CSSProperties, type ReactNode, useState } from "react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const BG_SWATCHES = [
	{
		name: "background",
		var: "--background",
		hex: "#0A0710",
		desc: "Page background",
	},
	{ name: "card", var: "--card", hex: "#110E18", desc: "Cards, panels" },
	{
		name: "popover",
		var: "--popover",
		hex: "#1A1622",
		desc: "Modals, popovers",
	},
	{ name: "muted", var: "--muted", hex: "#231E2D", desc: "Hover states" },
] as const;

const TEXT_LEVELS = [
	{
		name: "foreground",
		var: "--foreground",
		hex: "#ECEEF4",
		desc: "Headings, body",
	},
	{
		name: "muted-fg",
		var: "--muted-foreground",
		hex: "#928BA8",
		desc: "Labels, captions",
	},
	{
		name: "tertiary",
		var: "--text-tertiary",
		hex: "#635C78",
		desc: "Metadata, hints",
	},
	{
		name: "disabled",
		var: "--text-disabled",
		hex: "#433D56",
		desc: "Disabled elements",
	},
] as const;

const PURPLE_SCALE = [
	{ step: "50", hex: "#F5F3FF" },
	{ step: "100", hex: "#EDE9FE" },
	{ step: "200", hex: "#DDD6FE" },
	{ step: "300", hex: "#C4B5FD" },
	{ step: "400", hex: "#A78BFA" },
	{ step: "500", hex: "#8B5CF6" },
	{ step: "600", hex: "#7C3AED" },
	{ step: "700", hex: "#6D28D9" },
	{ step: "800", hex: "#5B21B6" },
	{ step: "900", hex: "#4C1D95" },
	{ step: "950", hex: "#2E1065" },
] as const;

const LAVENDER_SCALE = [
	{ step: "50", hex: "#F8F6FC" },
	{ step: "100", hex: "#EDE8F5" },
	{ step: "200", hex: "#DDD4ED" },
	{ step: "300", hex: "#C4B5E0" },
	{ step: "400", hex: "#A893D1" },
	{ step: "500", hex: "#9B8BCA" },
	{ step: "600", hex: "#7E6DB5" },
	{ step: "700", hex: "#6B5A9E" },
	{ step: "800", hex: "#574885" },
	{ step: "900", hex: "#3D3366" },
	{ step: "950", hex: "#1A1530" },
] as const;

const SEMANTIC_COLORS = [
	{ name: "success", color: "#22C55E", muted: "rgba(34,197,94,0.12)" },
	{ name: "warning", color: "#F59E0B", muted: "rgba(245,158,11,0.12)" },
	{ name: "error", color: "#EF4444", muted: "rgba(239,68,68,0.12)" },
	{ name: "info", color: "#9B8BCA", muted: "rgba(155,139,202,0.12)" },
] as const;

const VERTICALS = [
	{ key: "ai", label: "AI / ML", color: "#FF66B3", flag: "house" },
	{ key: "biotech", label: "Biotech", color: "#00BD68", flag: "house" },
	{ key: "hardware", label: "Hardware", color: "#FFB300", flag: "house" },
	{ key: "cleantech", label: "Cleantech", color: "#2DD4BF" },
	{ key: "agritech", label: "Agritech", color: "#A3E635" },
	{ key: "medtech", label: "Medtech", color: "#F87171" },
	{ key: "materials", label: "Materials", color: "#A78BFA" },
	{ key: "aerospace", label: "Aerospace", color: "#38BDF8" },
	{ key: "quantum", label: "Quantum", color: "#D946EF" },
	{ key: "fintech", label: "FinTech", color: "#6366F1" },
	{ key: "blockchain", label: "Blockchain", color: "#22D3EE" },
	{ key: "other", label: "Other", color: "#94A3B8" },
] as const;

const TYPE_SCALE = [
	{ name: "xs", size: "0.75rem", px: "12", lh: "1rem" },
	{ name: "sm", size: "0.8125rem", px: "13", lh: "1.25rem" },
	{ name: "base", size: "0.9375rem", px: "15", lh: "1.5rem" },
	{ name: "md", size: "1rem", px: "16", lh: "1.625rem" },
	{ name: "lg", size: "1.125rem", px: "18", lh: "1.75rem" },
	{ name: "xl", size: "1.25rem", px: "20", lh: "1.875rem" },
	{ name: "2xl", size: "1.5rem", px: "24", lh: "2rem" },
	{ name: "3xl", size: "1.875rem", px: "30", lh: "2.375rem" },
	{ name: "4xl", size: "2.25rem", px: "36", lh: "2.75rem" },
] as const;

const BAR_DATA = [
	{ label: "AI/ML", value: 24, color: "#FF66B3" },
	{ label: "Biotech", value: 18, color: "#00BD68" },
	{ label: "Hardware", value: 14, color: "#FFB300" },
	{ label: "Cleantech", value: 12, color: "#2DD4BF" },
	{ label: "FinTech", value: 10, color: "#6366F1" },
	{ label: "Agritech", value: 8, color: "#A3E635" },
	{ label: "Other", value: 14, color: "#94A3B8" },
] as const;

const SECTIONS = [
	{ id: "colors", label: "Colors" },
	{ id: "typography", label: "Typography" },
	{ id: "buttons", label: "Buttons" },
	{ id: "inputs", label: "Inputs" },
	{ id: "cards", label: "Cards" },
	{ id: "tags", label: "Tags & Badges" },
	{ id: "stats", label: "Stats" },
	{ id: "charts", label: "Charts" },
	{ id: "dividers", label: "Dividers" },
] as const;

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------
function Overline({ children }: { children: ReactNode }) {
	return (
		<span
			className="inline-block tracking-[0.08em] uppercase"
			style={{
				fontFamily: "var(--font-heading)",
				fontSize: "0.75rem",
				fontWeight: 600,
				color: "var(--primary)",
			}}
		>
			{children}
		</span>
	);
}

function SectionHeading({
	id,
	overline,
	title,
}: {
	id: string;
	overline: string;
	title: string;
}) {
	return (
		<div
			id={id}
			className="ds-section mb-10 scroll-mt-8 pt-16 first:pt-0"
			style={{ animationDelay: `${Number.parseInt(overline) * 0.08}s` }}
		>
			<Overline>{overline}</Overline>
			<h2
				className="mt-2"
				style={{
					fontFamily: "var(--font-display)",
					fontSize: "2.25rem",
					lineHeight: "2.75rem",
					letterSpacing: "-0.025em",
					fontWeight: "var(--font-display-weight)" as unknown as number,
					color: "var(--foreground)",
				}}
			>
				{title}
			</h2>
			{/* Accent line divider */}
			<div
				className="mt-4 h-px w-full"
				style={{
					background:
						"linear-gradient(90deg, var(--primary) 0%, transparent 60%)",
				}}
			/>
		</div>
	);
}

function SubHeading({ children }: { children: ReactNode }) {
	return (
		<h3
			className="mb-4 mt-8"
			style={{
				fontFamily: "var(--font-heading)",
				fontSize: "1rem",
				fontWeight: 600,
				color: "var(--muted-foreground)",
				letterSpacing: "0.02em",
			}}
		>
			{children}
		</h3>
	);
}

function ColorSwatch({
	color,
	label,
	hex,
	size = "md",
	ring,
}: {
	color: string;
	label: string;
	hex: string;
	size?: "sm" | "md";
	ring?: boolean;
}) {
	const dim = size === "sm" ? "h-10 w-10" : "h-14 w-14";
	return (
		<div className="flex flex-col items-center gap-1.5">
			<div
				className={`${dim} rounded-lg flex-shrink-0`}
				style={{
					background: color,
					borderRadius: "var(--radius)",
					border: ring
						? `2px solid ${color}`
						: "1px solid var(--border-subtle)",
				}}
			/>
			<span
				className="text-center leading-tight"
				style={{
					fontFamily: "var(--font-heading)",
					fontSize: "0.6875rem",
					fontWeight: 500,
					color: "var(--muted-foreground)",
				}}
			>
				{label}
			</span>
			<span
				style={{
					fontFamily: "var(--font-mono)",
					fontSize: "0.625rem",
					color: "var(--text-tertiary)",
				}}
			>
				{hex}
			</span>
		</div>
	);
}

function VerticalTag({ label, color }: { label: string; color: string }) {
	return (
		<span
			className="inline-flex items-center gap-1.5"
			style={{
				fontFamily: "var(--font-heading)",
				fontSize: "0.75rem",
				fontWeight: 500,
				color: color,
				background: `${color}26`,
				border: `1px solid ${color}40`,
				borderRadius: "var(--radius-full)",
				padding: "0.125rem 0.625rem",
			}}
		>
			<span
				className="inline-block h-1.5 w-1.5 rounded-full"
				style={{ background: color }}
			/>
			{label}
		</span>
	);
}

function MaturityBadge({
	level,
	variant,
}: {
	level: string;
	variant: "seed" | "seriesA" | "seriesB" | "growth";
}) {
	const colors = {
		seed: {
			bg: "var(--warning-muted)",
			text: "var(--warning)",
			border: "rgba(245,158,11,0.3)",
		},
		seriesA: {
			bg: "var(--info-muted)",
			text: "var(--info)",
			border: "rgba(61,165,217,0.3)",
		},
		seriesB: {
			bg: "rgba(167,139,250,0.12)",
			text: "#A78BFA",
			border: "rgba(167,139,250,0.3)",
		},
		growth: {
			bg: "var(--success-muted)",
			text: "var(--success)",
			border: "rgba(34,197,94,0.3)",
		},
	};
	const c = colors[variant];
	return (
		<span
			style={{
				fontFamily: "var(--font-heading)",
				fontSize: "0.6875rem",
				fontWeight: 600,
				letterSpacing: "0.04em",
				textTransform: "uppercase" as const,
				color: c.text,
				background: c.bg,
				border: `1px solid ${c.border}`,
				borderRadius: "var(--radius-sm)",
				padding: "0.125rem 0.5rem",
			}}
		>
			{level}
		</span>
	);
}

function TrendArrow({
	direction,
	value,
}: {
	direction: "up" | "down";
	value: string;
}) {
	const isUp = direction === "up";
	const Icon = isUp ? AltArrowUp : AltArrowDown;
	return (
		<span
			className="inline-flex items-center gap-1"
			style={{
				fontFamily: "var(--font-mono)",
				fontSize: "0.8125rem",
				fontWeight: 500,
				color: isUp ? "var(--success)" : "var(--error)",
			}}
		>
			<Icon size={12} />
			{value}
		</span>
	);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function DesignSystemPreview() {
	const [activeSection, setActiveSection] = useState("colors");

	return (
		<>
			<div
				className="ds-root ds-grain relative flex min-h-screen"
				style={{
					background: "var(--background)",
					color: "var(--foreground)",
					fontFamily: "var(--font-body)",
					fontSize: "0.9375rem",
					lineHeight: "1.5rem",
				}}
			>
				{/* ------------------------------------------------------------ */}
				{/* Sidebar Nav                                                  */}
				{/* ------------------------------------------------------------ */}
				<nav
					className="sticky top-0 hidden h-screen w-56 flex-shrink-0 flex-col border-r lg:flex"
					style={{
						background: "var(--card)",
						borderColor: "var(--border-subtle)",
					}}
				>
					{/* Brand mark */}
					<div className="px-5 pb-4 pt-8">
						<div className="flex flex-col items-start gap-1.5">
							<img
								src="/brand/logo-transparent-ondark.svg"
								alt="404 Tech Found"
								style={{ height: "2rem", width: "auto" }}
							/>
							<span
								className="tracking-[0.16em] uppercase"
								style={{
									fontFamily: "var(--font-heading)",
									fontSize: "0.625rem",
									fontWeight: 500,
									color: "var(--text-tertiary)",
								}}
							>
								Design System
							</span>
						</div>
						<div
							className="mt-4 h-px"
							style={{ background: "var(--border-subtle)" }}
						/>
					</div>

					{/* Section links */}
					<div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
						{SECTIONS.map((s) => {
							const isActive = activeSection === s.id;
							return (
								<a
									key={s.id}
									href={`#${s.id}`}
									onClick={() => setActiveSection(s.id)}
									className="block transition-colors"
									style={{
										fontFamily: "var(--font-heading)",
										fontSize: "0.8125rem",
										fontWeight: isActive ? 600 : 400,
										color: isActive
											? "var(--primary)"
											: "var(--muted-foreground)",
										background: isActive ? "var(--primary-8)" : "transparent",
										borderRadius: "var(--radius-md)",
										padding: "0.5rem 0.75rem",
										textDecoration: "none",
									}}
								>
									{s.label}
								</a>
							);
						})}
					</div>

					{/* Version */}
					<div className="px-5 py-4">
						<span
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: "0.6875rem",
								color: "var(--text-disabled)",
							}}
						>
							v1.0 — Report Platform
						</span>
					</div>
				</nav>

				{/* ------------------------------------------------------------ */}
				{/* Main content                                                 */}
				{/* ------------------------------------------------------------ */}
				<main className="ds-glow relative min-w-0 flex-1 px-6 pb-24 pt-8 lg:px-12">
					<div className="relative z-[2] mx-auto max-w-5xl">
						{/* Header */}
						<header
							className="mb-4"
							style={{
								animation: "ds-fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
							}}
						>
							<img
								src="/brand/logo-transparent-ondark.svg"
								alt="404 Tech Found"
								style={{ height: "2.5rem", width: "auto" }}
							/>
							<h1
								className="mt-4"
								style={{
									fontFamily: "var(--font-display)",
									fontSize: "3.75rem",
									lineHeight: "4.25rem",
									letterSpacing: "-0.035em",
									fontWeight: "var(--font-display-weight)" as unknown as number,
									fontStyle:
										"var(--font-display-style)" as React.CSSProperties["fontStyle"],
									color: "var(--foreground)",
								}}
							>
								Design System
							</h1>
							<p
								className="mt-3 max-w-2xl"
								style={{
									fontFamily: "var(--font-body)",
									fontSize: "1.125rem",
									lineHeight: "1.75rem",
									color: "var(--muted-foreground)",
									letterSpacing: "-0.005em",
								}}
							>
								Living style guide for the LATAM Deeptech Report platform. Every
								token, component, and pattern rendered from the spec.
							</p>
						</header>

						{/* ====================================================== */}
						{/* COLORS                                                  */}
						{/* ====================================================== */}
						<SectionHeading id="colors" overline="01" title="Color System" />

						{/* Backgrounds */}
						<SubHeading>Backgrounds</SubHeading>
						<div className="flex flex-wrap gap-4">
							{BG_SWATCHES.map((s) => (
								<div
									key={s.name}
									className="flex items-center gap-3 rounded-lg border px-4 py-3"
									style={{
										background: s.hex,
										borderColor: "var(--border-subtle)",
										minWidth: "200px",
									}}
								>
									<div
										className="h-10 w-10 flex-shrink-0 rounded-md"
										style={{
											background: s.hex,
											border: "1px solid var(--border)",
										}}
									/>
									<div>
										<div
											style={{
												fontFamily: "var(--font-heading)",
												fontSize: "0.8125rem",
												fontWeight: 500,
												color: "var(--foreground)",
											}}
										>
											bg.{s.name}
										</div>
										<div
											style={{
												fontFamily: "var(--font-mono)",
												fontSize: "0.6875rem",
												color: "var(--text-tertiary)",
											}}
										>
											{s.hex}
										</div>
										<div
											style={{
												fontFamily: "var(--font-body)",
												fontSize: "0.6875rem",
												color: "var(--text-disabled)",
												marginTop: "1px",
											}}
										>
											{s.desc}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Text levels */}
						<SubHeading>Text Hierarchy</SubHeading>
						<div className="space-y-3">
							{TEXT_LEVELS.map((t) => (
								<div key={t.name} className="flex items-center gap-4">
									<span
										className="w-20 flex-shrink-0 text-right"
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "0.6875rem",
											color: "var(--text-disabled)",
										}}
									>
										{t.hex}
									</span>
									<span
										style={{
											fontFamily: "var(--font-body)",
											fontSize: "1.125rem",
											fontWeight: 500,
											color: t.hex,
										}}
									>
										{t.desc}
									</span>
									<span
										className="ml-auto"
										style={{
											fontFamily: "var(--font-heading)",
											fontSize: "0.75rem",
											color: "var(--text-tertiary)",
										}}
									>
										text.{t.name}
									</span>
								</div>
							))}
						</div>

						{/* Purple scale */}
						<SubHeading>Purple — Primary Scale</SubHeading>
						<div className="flex flex-wrap gap-2.5">
							{PURPLE_SCALE.map((g) => (
								<ColorSwatch
									key={g.step}
									color={g.hex}
									label={g.step}
									hex={g.hex}
									ring={g.step === "600"}
								/>
							))}
						</div>

						{/* Lavender scale */}
						<SubHeading>Lavender — Secondary Scale</SubHeading>
						<div className="flex flex-wrap gap-2.5">
							{LAVENDER_SCALE.map((s) => (
								<ColorSwatch
									key={s.step}
									color={s.hex}
									label={s.step}
									hex={s.hex}
									ring={s.step === "500"}
								/>
							))}
						</div>

						{/* Semantic */}
						<SubHeading>Semantic</SubHeading>
						<div className="flex flex-wrap gap-4">
							{SEMANTIC_COLORS.map((s) => (
								<div
									key={s.name}
									className="flex items-center gap-3 rounded-lg border px-4 py-3"
									style={{
										background: s.muted,
										borderColor: `${s.color}40`,
										minWidth: "160px",
									}}
								>
									<div
										className="h-8 w-8 flex-shrink-0 rounded-full"
										style={{ background: s.color }}
									/>
									<div>
										<div
											style={{
												fontFamily: "var(--font-heading)",
												fontSize: "0.8125rem",
												fontWeight: 600,
												color: s.color,
												textTransform: "capitalize" as const,
											}}
										>
											{s.name}
										</div>
										<div
											style={{
												fontFamily: "var(--font-mono)",
												fontSize: "0.625rem",
												color: "var(--text-tertiary)",
											}}
										>
											{s.color}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Verticals */}
						<SubHeading>Verticals — Data Visualization Palette</SubHeading>
						<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
							{VERTICALS.map((v) => (
								<div
									key={v.key}
									className="flex flex-col items-center gap-2 rounded-lg border px-3 py-3"
									style={{
										background: `${v.color}10`,
										borderColor: `${v.color}25`,
									}}
								>
									<div
										className="h-8 w-8 rounded-full"
										style={{
											background: v.color,
											boxShadow: `0 0 12px ${v.color}40`,
										}}
									/>
									<div className="text-center">
										<div
											style={{
												fontFamily: "var(--font-heading)",
												fontSize: "0.75rem",
												fontWeight: 500,
												color: v.color,
											}}
										>
											{v.label}
										</div>
										<div
											style={{
												fontFamily: "var(--font-mono)",
												fontSize: "0.5625rem",
												color: "var(--text-disabled)",
												marginTop: "2px",
											}}
										>
											{v.color}
										</div>
										{"flag" in v && v.flag === "house" && (
											<span
												className="mt-1 inline-block"
												style={{
													fontFamily: "var(--font-mono)",
													fontSize: "0.5625rem",
													color: "var(--primary)",
													background: "var(--primary-10)",
													padding: "0 4px",
													borderRadius: "2px",
												}}
											>
												house
											</span>
										)}
									</div>
								</div>
							))}
						</div>

						{/* ====================================================== */}
						{/* TYPOGRAPHY                                              */}
						{/* ====================================================== */}
						<SectionHeading id="typography" overline="02" title="Typography" />

						{/* Display — Bricolage Grotesque */}
						<SubHeading>Display — Bricolage Grotesque</SubHeading>
						<div
							className="space-y-4 rounded-xl border p-6"
							style={{
								background: "var(--card)",
								borderColor: "var(--border-subtle)",
							}}
						>
							<div
								style={{
									fontFamily: "var(--font-display)",
									fontSize: "4.5rem",
									lineHeight: "5rem",
									letterSpacing: "-0.04em",
									color: "var(--foreground)",
								}}
							>
								100 Startups
							</div>
							<div
								style={{
									fontFamily: "var(--font-display)",
									fontSize: "3.75rem",
									lineHeight: "4.25rem",
									letterSpacing: "-0.035em",
									color: "var(--primary)",
								}}
							>
								$2.4 Billion
							</div>
							<div
								style={{
									fontFamily: "var(--font-display)",
									fontSize: "2.25rem",
									lineHeight: "2.75rem",
									letterSpacing: "-0.025em",
									fontStyle:
										"var(--font-display-style)" as React.CSSProperties["fontStyle"],
									color: "var(--muted-foreground)",
								}}
							>
								The Definitive LATAM Deeptech Directory
							</div>
						</div>

						{/* Heading — Space Grotesk */}
						<SubHeading>Heading — Space Grotesk</SubHeading>
						<div className="space-y-3">
							<div
								style={{
									fontFamily: "var(--font-heading)",
									fontSize: "1.875rem",
									lineHeight: "2.375rem",
									fontWeight: 700,
									letterSpacing: "-0.02em",
								}}
							>
								H1 — Ecosystem Overview
							</div>
							<div
								style={{
									fontFamily: "var(--font-heading)",
									fontSize: "1.5rem",
									lineHeight: "2rem",
									fontWeight: 600,
									letterSpacing: "-0.015em",
								}}
							>
								H2 — Funding by Vertical
							</div>
							<div
								style={{
									fontFamily: "var(--font-heading)",
									fontSize: "1.25rem",
									lineHeight: "1.875rem",
									fontWeight: 600,
									letterSpacing: "-0.01em",
								}}
							>
								H3 — Regional Distribution
							</div>
							<div
								style={{
									fontFamily: "var(--font-heading)",
									fontSize: "1.125rem",
									lineHeight: "1.75rem",
									fontWeight: 500,
									letterSpacing: "-0.005em",
									color: "var(--muted-foreground)",
								}}
							>
								H4 — Methodology Notes
							</div>
						</div>

						{/* Body — Plus Jakarta Sans */}
						<SubHeading>Body — Plus Jakarta Sans</SubHeading>
						<div className="max-w-2xl space-y-3">
							<p
								style={{
									fontFamily: "var(--font-body)",
									fontSize: "1rem",
									lineHeight: "1.625rem",
								}}
							>
								NovaBio is a Mexico City-based biotech startup developing
								CRISPR-based crop resistance platforms for tropical agriculture.
								Founded in 2022, they have raised $12.5M in Series A funding led
								by ALLVP and Kaszek.
							</p>
							<p
								style={{
									fontFamily: "var(--font-body)",
									fontSize: "0.9375rem",
									lineHeight: "1.5rem",
									color: "var(--muted-foreground)",
								}}
							>
								This report profiles 100 deeptech startups across 12 LATAM
								countries, covering verticals from AI/ML to quantum computing.
								Data collected between January and March 2026.
							</p>
							<p
								style={{
									fontFamily: "var(--font-body)",
									fontSize: "0.8125rem",
									lineHeight: "1.25rem",
									color: "var(--text-tertiary)",
								}}
							>
								Methodology: Startups selected based on technology readiness
								level (TRL 4+), minimum $500K in verifiable funding, and active
								operations in at least one LATAM country.
							</p>
						</div>

						{/* Data — JetBrains Mono */}
						<SubHeading>Data — JetBrains Mono</SubHeading>
						<div className="flex flex-wrap items-end gap-8">
							<div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "3rem",
										lineHeight: "3.5rem",
										fontWeight: 500,
										color: "var(--primary)",
										letterSpacing: "-0.03em",
									}}
								>
									$2.4B
								</div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.8125rem",
										color: "var(--text-tertiary)",
									}}
								>
									dataLg — Total Funding
								</div>
							</div>
							<div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.9375rem",
										color: "var(--foreground)",
									}}
								>
									MXN 240,000,000
								</div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.75rem",
										color: "var(--text-tertiary)",
									}}
								>
									data — Currency Format
								</div>
							</div>
							<div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.8125rem",
										color: "var(--muted-foreground)",
									}}
								>
									ID-NB-2024-0847
								</div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.75rem",
										color: "var(--text-tertiary)",
									}}
								>
									dataSm — Reference Code
								</div>
							</div>
						</div>

						{/* Full scale table */}
						<SubHeading>Type Scale Reference</SubHeading>
						<div
							className="overflow-hidden rounded-lg border"
							style={{ borderColor: "var(--border-subtle)" }}
						>
							{TYPE_SCALE.map((t, i) => (
								<div
									key={t.name}
									className="flex items-baseline gap-4 border-b px-4 py-2.5"
									style={{
										background:
											i % 2 === 0 ? "var(--card)" : "var(--background)",
										borderColor: "var(--border-subtle)",
									}}
								>
									<span
										className="w-10 flex-shrink-0"
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "0.6875rem",
											color: "var(--primary)",
											fontWeight: 500,
										}}
									>
										{t.name}
									</span>
									<span
										className="w-16 flex-shrink-0"
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "0.6875rem",
											color: "var(--text-disabled)",
										}}
									>
										{t.px}px
									</span>
									<span
										style={{
											fontFamily: "var(--font-body)",
											fontSize: t.size,
											lineHeight: t.lh,
											color: "var(--foreground)",
										}}
									>
										LATAM Deeptech
									</span>
								</div>
							))}
						</div>

						{/* ====================================================== */}
						{/* BUTTONS                                                 */}
						{/* ====================================================== */}
						<SectionHeading id="buttons" overline="03" title="Buttons" />

						<div className="grid gap-8 md:grid-cols-3">
							{/* Primary */}
							<div className="space-y-3">
								<SubHeading>Primary</SubHeading>
								<ButtonDemo
									label="Explore Directory"
									style={{
										background: "var(--primary)",
										color: "var(--background)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "none",
										cursor: "pointer",
										transition: "all 150ms ease-out",
									}}
									hoverStyle={{ background: "var(--primary-light)" }}
								/>
								<ButtonDemo
									label="Explore Directory"
									sublabel="hover"
									style={{
										background: "var(--primary-light)",
										color: "var(--background)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "none",
										boxShadow: "var(--glow-primary)",
									}}
								/>
								<ButtonDemo
									label="Explore Directory"
									sublabel="disabled"
									style={{
										background: "var(--primary-darker)",
										color: "var(--primary-dark)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "none",
										cursor: "not-allowed",
										opacity: 0.7,
									}}
								/>
							</div>

							{/* Secondary */}
							<div className="space-y-3">
								<SubHeading>Secondary</SubHeading>
								<ButtonDemo
									label="Download Report"
									style={{
										background: "transparent",
										color: "var(--primary)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "1px solid var(--primary-40)",
										cursor: "pointer",
										transition: "all 150ms ease-out",
									}}
									hoverStyle={{
										background: "var(--primary-8)",
										borderColor: "var(--primary-60)",
									}}
								/>
								<ButtonDemo
									label="Download Report"
									sublabel="hover"
									style={{
										background: "var(--primary-8)",
										color: "var(--primary)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "1px solid var(--primary-60)",
									}}
								/>
								<ButtonDemo
									label="Download Report"
									sublabel="disabled"
									style={{
										background: "transparent",
										color: "var(--text-disabled)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "1px solid var(--border-subtle)",
										cursor: "not-allowed",
										opacity: 0.7,
									}}
								/>
							</div>

							{/* Ghost */}
							<div className="space-y-3">
								<SubHeading>Ghost</SubHeading>
								<ButtonDemo
									label="View All Startups"
									style={{
										background: "transparent",
										color: "var(--muted-foreground)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "none",
										cursor: "pointer",
										transition: "all 150ms ease-out",
									}}
									hoverStyle={{
										background: "rgba(255,255,255,0.06)",
										color: "var(--foreground)",
									}}
								/>
								<ButtonDemo
									label="View All Startups"
									sublabel="hover"
									style={{
										background: "rgba(255,255,255,0.06)",
										color: "var(--foreground)",
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "0.875rem",
										padding: "0.625rem 1.25rem",
										borderRadius: "var(--radius-md)",
										border: "none",
									}}
								/>
							</div>
						</div>

						{/* ====================================================== */}
						{/* INPUTS                                                  */}
						{/* ====================================================== */}
						<SectionHeading id="inputs" overline="04" title="Inputs" />

						<div className="grid gap-6 md:grid-cols-3">
							{/* Text input */}
							<div className="space-y-2">
								<label
									style={{
										fontFamily: "var(--font-heading)",
										fontSize: "0.8125rem",
										fontWeight: 500,
										color: "var(--muted-foreground)",
									}}
								>
									Company Name
								</label>
								<input
									type="text"
									placeholder="e.g. NovaBio"
									className="block w-full outline-none"
									style={{
										background: "var(--background)",
										border: "1px solid var(--border)",
										borderRadius: "var(--radius-md)",
										padding: "0.625rem 0.875rem",
										fontFamily: "var(--font-body)",
										fontSize: "0.9375rem",
										color: "var(--foreground)",
									}}
								/>
							</div>

							{/* Select */}
							<div className="space-y-2">
								<label
									style={{
										fontFamily: "var(--font-heading)",
										fontSize: "0.8125rem",
										fontWeight: 500,
										color: "var(--muted-foreground)",
									}}
								>
									Country
								</label>
								<div className="relative">
									<select
										className="block w-full appearance-none outline-none"
										style={{
											background: "var(--background)",
											border: "1px solid var(--border)",
											borderRadius: "var(--radius-md)",
											padding: "0.625rem 2.5rem 0.625rem 0.875rem",
											fontFamily: "var(--font-body)",
											fontSize: "0.9375rem",
											color: "var(--foreground)",
										}}
									>
										<option>Mexico</option>
										<option>Brazil</option>
										<option>Colombia</option>
										<option>Chile</option>
										<option>Argentina</option>
									</select>
									<div
										className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
										style={{ color: "var(--text-tertiary)" }}
									>
										<AltArrowDown size={14} />
									</div>
								</div>
							</div>

							{/* Search */}
							<div className="space-y-2">
								<label
									style={{
										fontFamily: "var(--font-heading)",
										fontSize: "0.8125rem",
										fontWeight: 500,
										color: "var(--muted-foreground)",
									}}
								>
									Search
								</label>
								<div className="relative">
									<div
										className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
										style={{ color: "var(--text-tertiary)" }}
									>
										<Magnifier size={16} />
									</div>
									<input
										type="search"
										placeholder="Search startups, verticals, countries..."
										className="block w-full outline-none"
										style={{
											background: "var(--background)",
											border: "1px solid var(--border)",
											borderRadius: "var(--radius-md)",
											padding: "0.625rem 0.875rem 0.625rem 2.25rem",
											fontFamily: "var(--font-body)",
											fontSize: "0.9375rem",
											color: "var(--foreground)",
										}}
									/>
								</div>
							</div>
						</div>

						{/* ====================================================== */}
						{/* CARDS                                                   */}
						{/* ====================================================== */}
						<SectionHeading id="cards" overline="05" title="Cards" />

						<div className="grid gap-6 lg:grid-cols-2">
							{/* Default startup card */}
							<div
								className="rounded-lg border transition-colors"
								style={{
									background: "var(--card)",
									borderColor: "var(--border-subtle)",
									borderRadius: "var(--radius)",
									padding: "1.5rem",
								}}
							>
								<div className="flex items-start gap-4">
									{/* Logo placeholder */}
									<div
										className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
										style={{
											background: `${"#00BD68"}18`,
											border: `1px solid ${"#00BD68"}30`,
											fontFamily: "var(--font-heading)",
											fontSize: "0.875rem",
											fontWeight: 700,
											color: "#00BD68",
										}}
									>
										NB
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<h4
												style={{
													fontFamily: "var(--font-heading)",
													fontSize: "1.125rem",
													fontWeight: 600,
													color: "var(--foreground)",
												}}
											>
												NovaBio
											</h4>
											<MaturityBadge level="Series A" variant="seriesA" />
										</div>
										<p
											className="mt-1"
											style={{
												fontFamily: "var(--font-body)",
												fontSize: "0.8125rem",
												lineHeight: "1.25rem",
												color: "var(--muted-foreground)",
											}}
										>
											CRISPR-based crop resistance platform for tropical
											agriculture
										</p>
									</div>
								</div>

								{/* Meta row */}
								<div className="mt-4 flex items-center gap-3">
									<span
										style={{
											fontFamily: "var(--font-body)",
											fontSize: "0.8125rem",
											color: "var(--text-tertiary)",
										}}
									>
										<span className="mr-1">&#127474;&#127485;</span> Mexico City
									</span>
									<span
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "0.8125rem",
											fontWeight: 500,
											color: "var(--primary)",
										}}
									>
										$12.5M
									</span>
								</div>

								{/* Tags */}
								<div className="mt-3 flex flex-wrap gap-1.5">
									<VerticalTag label="Biotech" color="#00BD68" />
									<VerticalTag label="Agritech" color="#A3E635" />
								</div>
							</div>

							{/* Featured startup card */}
							<div
								className="rounded-lg border"
								style={{
									background: "var(--card)",
									borderColor: "var(--primary-25)",
									borderRadius: "var(--radius-lg)",
									padding: "2rem",
									boxShadow: "0 0 20px var(--primary-8)",
								}}
							>
								<div className="mb-3 flex items-center gap-2">
									<span
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "0.6875rem",
											fontWeight: 600,
											color: "var(--primary)",
											background: "var(--primary-10)",
											padding: "0.125rem 0.5rem",
											borderRadius: "var(--radius-sm)",
											letterSpacing: "0.04em",
											textTransform: "uppercase" as const,
										}}
									>
										Featured
									</span>
								</div>
								<div className="flex items-start gap-4">
									<div
										className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
										style={{
											background: "#FF66B318",
											border: "1px solid #FF66B330",
											fontFamily: "var(--font-heading)",
											fontSize: "0.875rem",
											fontWeight: 700,
											color: "#FF66B3",
										}}
									>
										CA
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<h4
												style={{
													fontFamily: "var(--font-heading)",
													fontSize: "1.125rem",
													fontWeight: 600,
													color: "var(--foreground)",
												}}
											>
												CósmicaAI
											</h4>
											<MaturityBadge level="Seed" variant="seed" />
										</div>
										<p
											className="mt-1"
											style={{
												fontFamily: "var(--font-body)",
												fontSize: "0.8125rem",
												lineHeight: "1.25rem",
												color: "var(--muted-foreground)",
											}}
										>
											Autonomous quality inspection for manufacturing lines
											using computer vision
										</p>
									</div>
								</div>
								<div className="mt-4 flex items-center gap-3">
									<span
										style={{
											fontFamily: "var(--font-body)",
											fontSize: "0.8125rem",
											color: "var(--text-tertiary)",
										}}
									>
										<span className="mr-1">&#127463;&#127479;</span> S&atilde;o
										Paulo
									</span>
									<span
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "0.8125rem",
											fontWeight: 500,
											color: "var(--primary)",
										}}
									>
										$3.2M
									</span>
								</div>
								<div className="mt-3 flex flex-wrap gap-1.5">
									<VerticalTag label="AI / ML" color="#FF66B3" />
									<VerticalTag label="Hardware" color="#FFB300" />
								</div>
							</div>
						</div>

						{/* ====================================================== */}
						{/* TAGS & BADGES                                           */}
						{/* ====================================================== */}
						<SectionHeading id="tags" overline="06" title="Tags & Badges" />

						<SubHeading>Vertical Category Pills</SubHeading>
						<div className="flex flex-wrap gap-2">
							{VERTICALS.map((v) => (
								<VerticalTag key={v.key} label={v.label} color={v.color} />
							))}
						</div>

						<SubHeading>Maturity Level Indicators</SubHeading>
						<div className="flex flex-wrap gap-3">
							<MaturityBadge level="Pre-Seed" variant="seed" />
							<MaturityBadge level="Seed" variant="seed" />
							<MaturityBadge level="Series A" variant="seriesA" />
							<MaturityBadge level="Series B" variant="seriesB" />
							<MaturityBadge level="Growth" variant="growth" />
						</div>

						{/* ====================================================== */}
						{/* STATS                                                   */}
						{/* ====================================================== */}
						<SectionHeading id="stats" overline="07" title="Stat Blocks" />

						<div className="grid gap-6 md:grid-cols-3">
							<StatBlock
								value="100"
								label="Total Startups"
								trend={{ direction: "up", value: "+12 vs 2025" }}
							/>
							<StatBlock
								value="$2.4B"
								label="Total Funding"
								trend={{ direction: "up", value: "+34% YoY" }}
								gold
							/>
							<StatBlock value="12" label="Countries" sublabel="across LATAM" />
						</div>

						{/* ====================================================== */}
						{/* CHARTS                                                  */}
						{/* ====================================================== */}
						<SectionHeading id="charts" overline="08" title="Charts" />

						<SubHeading>Startups by Vertical</SubHeading>
						<div
							className="rounded-xl border p-6"
							style={{
								background: "var(--card)",
								borderColor: "var(--border-subtle)",
							}}
						>
							{/* Y-axis label */}
							<div className="mb-4 flex items-center justify-between">
								<span
									style={{
										fontFamily: "var(--font-heading)",
										fontSize: "0.875rem",
										fontWeight: 600,
										color: "var(--foreground)",
									}}
								>
									Distribution by Vertical
								</span>
								<span
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.75rem",
										color: "var(--text-tertiary)",
									}}
								>
									n=100
								</span>
							</div>

							{/* Bar chart */}
							<div className="flex items-end gap-2" style={{ height: "200px" }}>
								{BAR_DATA.map((bar, i) => {
									const maxVal = Math.max(...BAR_DATA.map((b) => b.value));
									const heightPct = (bar.value / maxVal) * 100;
									return (
										<div
											key={bar.label}
											className="flex flex-1 flex-col items-center gap-2"
										>
											{/* Value label */}
											<span
												style={{
													fontFamily: "var(--font-mono)",
													fontSize: "0.6875rem",
													fontWeight: 500,
													color: bar.color,
												}}
											>
												{bar.value}
											</span>
											{/* Bar */}
											<div
												className="w-full"
												style={{
													height: `${heightPct}%`,
													position: "relative",
												}}
											>
												<div
													className="absolute inset-0 w-full origin-bottom"
													style={{
														background: bar.color,
														borderRadius: "2px 2px 0 0",
														opacity: 0.85,
														animation: `ds-barGrow 600ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both`,
													}}
												/>
											</div>
											{/* X-axis label */}
											<span
												className="text-center"
												style={{
													fontFamily: "var(--font-heading)",
													fontSize: "0.5625rem",
													color: "var(--text-tertiary)",
													lineHeight: "1.1",
												}}
											>
												{bar.label}
											</span>
										</div>
									);
								})}
							</div>

							{/* Axis line */}
							<div
								className="mt-0 h-px w-full"
								style={{ background: "rgba(255,255,255,0.1)" }}
							/>

							{/* Grid lines overlay — decorative */}
							<div className="mt-3 flex items-center justify-between">
								<span
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.625rem",
										color: "var(--text-disabled)",
									}}
								>
									0
								</span>
								<span
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.625rem",
										color: "var(--text-disabled)",
									}}
								>
									Source: 404TF Research, Q1 2026
								</span>
							</div>
						</div>

						{/* ====================================================== */}
						{/* DIVIDERS                                                */}
						{/* ====================================================== */}
						<SectionHeading
							id="dividers"
							overline="09"
							title="Dividers & Separators"
						/>

						<div className="space-y-12">
							{/* Primary gradient line */}
							<div>
								<SubHeading>Primary Gradient</SubHeading>
								<div
									className="h-px w-full"
									style={{
										background:
											"linear-gradient(90deg, transparent 0%, var(--primary) 20%, var(--primary) 80%, transparent 100%)",
									}}
								/>
							</div>

							{/* Subtle border */}
							<div>
								<SubHeading>Subtle Border</SubHeading>
								<div
									className="h-px w-full"
									style={{ background: "var(--border)" }}
								/>
							</div>

							{/* Fade separator */}
							<div>
								<SubHeading>Section Fade</SubHeading>
								<div
									className="h-16 w-full"
									style={{
										background:
											"linear-gradient(180deg, var(--background) 0%, transparent 100%)",
									}}
								/>
							</div>

							{/* Decorative — dotted */}
							<div>
								<SubHeading>Primary Dot Pattern</SubHeading>
								<div className="flex items-center gap-1.5">
									{Array.from({ length: 40 }).map((_, i) => (
										<div
											key={i}
											className="h-px flex-1"
											style={{
												background:
													i % 2 === 0 ? "var(--primary)" : "transparent",
												opacity: 0.4,
											}}
										/>
									))}
								</div>
							</div>
						</div>

						{/* ====================================================== */}
						{/* Footer note                                             */}
						{/* ====================================================== */}
						<div
							className="mt-24 border-t pt-8"
							style={{ borderColor: "var(--border-subtle)" }}
						>
							<p
								style={{
									fontFamily: "var(--font-body)",
									fontSize: "0.8125rem",
									color: "var(--text-disabled)",
								}}
							>
								404 Tech Found — LATAM Deeptech Report Platform — Design System
								v1.0
							</p>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}

// ---------------------------------------------------------------------------
// Button demo wrapper — shows a button with optional state label
// ---------------------------------------------------------------------------
function ButtonDemo({
	label,
	sublabel,
	style,
	hoverStyle,
}: {
	label: string;
	sublabel?: string;
	style: CSSProperties;
	hoverStyle?: CSSProperties;
}) {
	const [hovered, setHovered] = useState(false);
	const merged = hovered && hoverStyle ? { ...style, ...hoverStyle } : style;

	return (
		<div className="flex items-center gap-3">
			<button
				type="button"
				style={merged}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
			>
				{label}
			</button>
			{sublabel && (
				<span
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: "0.6875rem",
						color: "var(--text-disabled)",
					}}
				>
					:{sublabel}
				</span>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Stat block
// ---------------------------------------------------------------------------
function StatBlock({
	value,
	label,
	sublabel,
	trend,
	gold,
}: {
	value: string;
	label: string;
	sublabel?: string;
	trend?: { direction: "up" | "down"; value: string };
	gold?: boolean;
}) {
	return (
		<div
			className="rounded-xl border p-6"
			style={{
				background: gold ? "var(--primary-4)" : "var(--card)",
				borderColor: gold ? "var(--primary-15)" : "var(--border-subtle)",
			}}
		>
			<div
				style={{
					fontFamily: "var(--font-display)",
					fontSize: "3rem",
					lineHeight: "3.5rem",
					letterSpacing: "-0.03em",
					color: gold ? "var(--primary)" : "var(--foreground)",
				}}
			>
				{value}
			</div>
			<div
				className="mt-1"
				style={{
					fontFamily: "var(--font-heading)",
					fontSize: "0.875rem",
					fontWeight: 500,
					color: "var(--muted-foreground)",
				}}
			>
				{label}
			</div>
			{sublabel && (
				<div
					className="mt-0.5"
					style={{
						fontFamily: "var(--font-body)",
						fontSize: "0.75rem",
						color: "var(--text-tertiary)",
					}}
				>
					{sublabel}
				</div>
			)}
			{trend && (
				<div className="mt-2">
					<TrendArrow direction={trend.direction} value={trend.value} />
				</div>
			)}
		</div>
	);
}

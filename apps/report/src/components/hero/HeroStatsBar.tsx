const STATS = [
	{ value: "100+", label: "Startups" },
	{ value: "12", label: "Countries" },
	{ value: "11", label: "Verticals" },
	{ value: "$2.4B", label: "Raised" },
];

export function HeroStatsBar() {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(4, auto)",
				gap: "1.5rem",
				alignItems: "center",
				justifyContent: "center",
				position: "relative",
				zIndex: 2,
			}}
			className="hero-stats-bar"
		>
			{STATS.map((stat, i) => (
				<div
					key={stat.label}
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "0.125rem",
						animation:
							"hero-statReveal 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
						animationDelay: `${300 + i * 100}ms`,
					}}
				>
					<span
						style={{
							fontFamily: "var(--font-mono)",
							fontSize: "1.25rem",
							fontWeight: 500,
							color: "var(--foreground)",
						}}
					>
						{stat.value}
					</span>
					<span
						style={{
							fontFamily: "var(--font-heading)",
							fontSize: "0.75rem",
							color: "var(--muted-foreground)",
							textTransform: "uppercase" as const,
							letterSpacing: "0.06em",
						}}
					>
						{stat.label}
					</span>
				</div>
			))}
			{/* Gradient dividers between stats (CSS-only) */}
			<style>{`
				.hero-stats-bar > div:not(:last-child)::after {
					content: "";
					position: absolute;
					right: -0.75rem;
					top: 50%;
					transform: translateY(-50%);
					width: 1px;
					height: 2rem;
					background: linear-gradient(180deg, transparent, var(--primary-40), transparent);
				}
				.hero-stats-bar > div {
					position: relative;
				}
				@media (max-width: 640px) {
					.hero-stats-bar {
						grid-template-columns: repeat(2, auto) !important;
						gap: 1rem !important;
					}
					.hero-stats-bar > div::after {
						display: none !important;
					}
				}
			`}</style>
		</div>
	);
}

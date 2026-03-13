import { VERTICALS, type VerticalKey } from "./data/verticals";

type VerticalFilterLegendProps = {
	activeVerticals: Set<VerticalKey>;
	onToggle: (key: VerticalKey) => void;
};

export function VerticalFilterLegend({
	activeVerticals,
	onToggle,
}: VerticalFilterLegendProps) {
	return (
		<>
			{/* Desktop: floating panel */}
			<div className="hero-legend-desktop" style={desktopStyles}>
				<div
					style={{
						fontFamily: "var(--font-heading)",
						fontSize: "0.6875rem",
						fontWeight: 600,
						color: "var(--muted-foreground)",
						textTransform: "uppercase" as const,
						letterSpacing: "0.06em",
						marginBottom: "0.5rem",
					}}
				>
					Verticals
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "0.25rem",
						maxHeight: "20rem",
						overflowY: "auto",
					}}
				>
					{VERTICALS.map((v) => {
						const active = activeVerticals.has(v.key);
						return (
							<button
								type="button"
								key={v.key}
								onClick={() => onToggle(v.key)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									padding: "0.25rem 0.5rem",
									borderRadius: "var(--radius-sm)",
									border: "none",
									background: "transparent",
									cursor: "pointer",
									transition: "background 150ms ease-out",
									fontFamily: "var(--font-body)",
									fontSize: "0.75rem",
									color: active ? "var(--foreground)" : "var(--text-disabled)",
									textAlign: "left" as const,
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = "rgba(255,255,255,0.04)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "transparent";
								}}
							>
								<span
									style={{
										display: "inline-block",
										width: "0.5rem",
										height: "0.5rem",
										borderRadius: "50%",
										background: active ? v.color : "transparent",
										border: active ? "none" : `1.5px solid ${v.color}60`,
										transition: "all 200ms ease-out",
										flexShrink: 0,
									}}
								/>
								{v.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Mobile: horizontal pill row */}
			<div className="hero-legend-mobile" style={mobileStyles}>
				{VERTICALS.map((v) => {
					const active = activeVerticals.has(v.key);
					return (
						<button
							type="button"
							key={v.key}
							onClick={() => onToggle(v.key)}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "0.375rem",
								padding: "0.25rem 0.625rem",
								borderRadius: "var(--radius-full)",
								border: `1px solid ${active ? `${v.color}40` : "var(--border-subtle)"}`,
								background: active ? `${v.color}15` : "transparent",
								cursor: "pointer",
								fontFamily: "var(--font-heading)",
								fontSize: "0.6875rem",
								fontWeight: 500,
								color: active ? v.color : "var(--text-disabled)",
								whiteSpace: "nowrap" as const,
								transition: "all 200ms ease-out",
								flexShrink: 0,
							}}
						>
							<span
								style={{
									width: "0.375rem",
									height: "0.375rem",
									borderRadius: "50%",
									background: active ? v.color : "transparent",
									border: active ? "none" : `1px solid ${v.color}60`,
								}}
							/>
							{v.label}
						</button>
					);
				})}
			</div>

			<style>{`
				.hero-legend-desktop {
					display: block;
				}
				.hero-legend-mobile {
					display: none !important;
				}
				@media (max-width: 1024px) {
					.hero-legend-desktop {
						display: none !important;
					}
					.hero-legend-mobile {
						display: flex !important;
					}
				}
			`}</style>
		</>
	);
}

const desktopStyles: React.CSSProperties = {
	position: "absolute",
	bottom: "1.5rem",
	left: "1.5rem",
	zIndex: 5,
	background: "rgba(10, 7, 16, 0.85)",
	backdropFilter: "blur(12px)",
	WebkitBackdropFilter: "blur(12px)",
	border: "1px solid var(--border-subtle)",
	borderRadius: "var(--radius)",
	padding: "0.75rem",
	minWidth: "10rem",
};

const mobileStyles: React.CSSProperties = {
	display: "flex",
	gap: "0.5rem",
	overflowX: "auto",
	padding: "0.5rem 0",
	position: "relative",
	zIndex: 5,
	scrollbarWidth: "none",
};

import type { Startup } from "./data/startups";
import { VERTICAL_MAP } from "./data/verticals";

type StartupTooltipProps = {
	startup: Startup;
	position: { x: number; y: number };
};

export function StartupTooltip({ startup, position }: StartupTooltipProps) {
	const vertical = VERTICAL_MAP[startup.vertical];

	// Position above the dot, centered horizontally
	const style: React.CSSProperties = {
		position: "absolute",
		left: position.x,
		top: position.y - 12,
		transform: "translate(-50%, -100%)",
		background: "var(--popover)",
		border: "1px solid var(--border)",
		borderRadius: "var(--radius-md)",
		padding: "0.75rem 1rem",
		boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
		pointerEvents: "none" as const,
		zIndex: 10,
		minWidth: "12rem",
		maxWidth: "16rem",
		animation: "hero-tooltipIn 150ms ease-out both",
	};

	return (
		<div style={style}>
			{/* Startup name */}
			<div
				style={{
					fontFamily: "var(--font-heading)",
					fontSize: "0.875rem",
					fontWeight: 600,
					color: "var(--foreground)",
					marginBottom: "0.375rem",
				}}
			>
				{startup.name}
			</div>

			{/* Vertical pill */}
			<span
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "0.375rem",
					fontFamily: "var(--font-heading)",
					fontSize: "0.6875rem",
					fontWeight: 500,
					color: vertical.color,
					background: `${vertical.color}26`,
					border: `1px solid ${vertical.color}40`,
					borderRadius: "var(--radius-full)",
					padding: "0.0625rem 0.5rem",
					marginBottom: "0.375rem",
				}}
			>
				<span
					style={{
						display: "inline-block",
						width: "0.375rem",
						height: "0.375rem",
						borderRadius: "50%",
						background: vertical.color,
					}}
				/>
				{vertical.label}
			</span>

			{/* One-liner */}
			<div
				style={{
					fontFamily: "var(--font-body)",
					fontSize: "0.75rem",
					lineHeight: 1.4,
					color: "var(--muted-foreground)",
				}}
			>
				{startup.oneLiner}
			</div>

			{/* Location */}
			<div
				style={{
					fontFamily: "var(--font-mono)",
					fontSize: "0.6875rem",
					color: "var(--text-tertiary)",
					marginTop: "0.25rem",
				}}
			>
				{startup.city}, {startup.country}
			</div>
		</div>
	);
}

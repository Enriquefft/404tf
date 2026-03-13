import { GRID_SPACING } from "./data/mapGrid";
import type { Startup } from "./data/startups";
import { VERTICAL_MAP } from "./data/verticals";

type StartupDotProps = {
	startup: Startup;
	isActive: boolean;
	onHover: (startup: Startup | null, element: SVGCircleElement | null) => void;
};

export function StartupDot({ startup, isActive, onHover }: StartupDotProps) {
	const color = VERTICAL_MAP[startup.vertical].color;
	const cx = startup.gridCol * GRID_SPACING;
	const cy = startup.gridRow * GRID_SPACING;

	return (
		<>
			{/* Outer glow — pulsing */}
			<circle
				cx={cx}
				cy={cy}
				r={16}
				fill={color}
				opacity={isActive ? 0.15 : 0}
				style={{
					filter: "blur(8px)",
					animation: isActive
						? "hero-dotPulse 3s ease-in-out infinite"
						: "none",
					transition: "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)",
				}}
			/>
			{/* Main dot */}
			<circle
				cx={cx}
				cy={cy}
				r={6}
				fill={color}
				opacity={isActive ? 0.85 : 0.2}
				style={{
					transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
				}}
			/>
			{/* Invisible hit target */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: SVG circle used as hit target for hover tooltip */}
			<circle
				cx={cx}
				cy={cy}
				r={20}
				fill="transparent"
				style={{ cursor: "pointer" }}
				onMouseEnter={(e) => onHover(startup, e.currentTarget)}
				onMouseLeave={() => onHover(null, null)}
			>
				<title>{`${startup.name} — ${startup.city}, ${startup.country}`}</title>
			</circle>
		</>
	);
}

import { useCallback, useMemo, useRef, useState } from "react";
import { GRID_SPACING, MAP_COLS, MAP_GRID, MAP_ROWS } from "./data/mapGrid";
import { STARTUPS, type Startup } from "./data/startups";
import type { VerticalKey } from "./data/verticals";
import { StartupDot } from "./StartupDot";
import { StartupTooltip } from "./StartupTooltip";

type DotGridMapProps = {
	activeVerticals: Set<VerticalKey>;
};

export function DotGridMap({ activeVerticals }: DotGridMapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const [hoveredStartup, setHoveredStartup] = useState<Startup | null>(null);
	const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
		null,
	);

	const viewBoxWidth = MAP_COLS * GRID_SPACING;
	const viewBoxHeight = MAP_ROWS * GRID_SPACING;

	// Pre-compute land dot positions
	const landDots = useMemo(() => {
		const dots: [number, number][] = [];
		for (let row = 0; row < MAP_ROWS; row++) {
			for (let col = 0; col < MAP_COLS; col++) {
				if (MAP_GRID[row]?.[col] === 1) {
					dots.push([col, row]);
				}
			}
		}
		return dots;
	}, []);

	const filteredStartups = useMemo(
		() => STARTUPS.filter((s) => activeVerticals.has(s.vertical)),
		[activeVerticals],
	);

	const handleHover = useCallback(
		(startup: Startup | null, element: SVGCircleElement | null) => {
			if (!startup || !element || !containerRef.current || !svgRef.current) {
				setHoveredStartup(null);
				setTooltipPos(null);
				return;
			}

			const svgRect = svgRef.current.getBoundingClientRect();
			const containerRect = containerRef.current.getBoundingClientRect();

			// Convert SVG coords to screen coords via proportional math
			const svgX = startup.gridCol * GRID_SPACING;
			const svgY = startup.gridRow * GRID_SPACING;
			const scaleX = svgRect.width / viewBoxWidth;
			const scaleY = svgRect.height / viewBoxHeight;

			const screenX = svgRect.left - containerRect.left + svgX * scaleX;
			const screenY = svgRect.top - containerRect.top + svgY * scaleY;

			setHoveredStartup(startup);
			setTooltipPos({ x: screenX, y: screenY });
		},
		[viewBoxWidth, viewBoxHeight],
	);

	return (
		<div
			ref={containerRef}
			style={{
				position: "relative",
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
				preserveAspectRatio="xMidYMid meet"
				role="img"
				aria-label="Dot-grid map of the Americas showing deeptech startup locations"
				style={{
					width: "100%",
					height: "100%",
					maxHeight: "70vh",
					overflow: "visible",
				}}
			>
				{/* Atmosphere gradient */}
				<defs>
					<radialGradient id="mapAtmosphere" cx="45%" cy="55%" r="50%">
						<stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
						<stop offset="60%" stopColor="var(--primary)" stopOpacity="0.03" />
						<stop offset="100%" stopColor="transparent" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* Atmosphere layer */}
				<rect
					x="0"
					y="0"
					width={viewBoxWidth}
					height={viewBoxHeight}
					fill="url(#mapAtmosphere)"
				/>

				{/* Background grid dots */}
				{landDots.map(([col, row]) => (
					<circle
						key={`${col}-${row}`}
						cx={col * GRID_SPACING}
						cy={row * GRID_SPACING}
						r={3}
						fill="var(--border-subtle)"
						opacity={0.5}
						style={{
							animation: "hero-gridShimmer 4s ease-in-out infinite",
							animationDelay: `${((col + row) % 12) * 0.4}s`,
						}}
					/>
				))}

				{/* Startup dots */}
				{filteredStartups.map((startup) => (
					<StartupDot
						key={startup.id}
						startup={startup}
						isActive={activeVerticals.has(startup.vertical)}
						onHover={handleHover}
					/>
				))}
			</svg>

			{/* HTML tooltip overlay */}
			{hoveredStartup && tooltipPos && (
				<StartupTooltip startup={hoveredStartup} position={tooltipPos} />
			)}
		</div>
	);
}

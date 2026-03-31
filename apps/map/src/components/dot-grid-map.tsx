import { useMemo } from "react";
import { AMERICAS_POINTS, LATAM_POINTS, projectToSvg } from "@/lib/map-points";
import type { VerticalKey } from "@/lib/verticals";

type StartupDot = {
	slug: string;
	name: string;
	lat: number;
	lng: number;
	verticals: string[];
};

type DotGridMapProps = {
	startups: StartupDot[];
	width?: number;
	height?: number;
};

/** CSS-variable-aware color lookup for inline styles */
const VERTICAL_RAW_COLORS: Record<string, string> = {
	ai_ml: "#ff2898",
	biotech: "#00cd4e",
	hardware_robotics: "#ff4834",
	cleantech: "#2dd4bf",
	agritech: "#a3e635",
	healthtech: "#f87171",
	advanced_materials: "#a78bfa",
	aerospace: "#38bdf8",
	quantum: "#d946ef",
	other: "#94a3b8",
};

function getStartupColor(verticals: string[]): string {
	const first = verticals[0] as VerticalKey | undefined;
	if (first && first in VERTICAL_RAW_COLORS) {
		return VERTICAL_RAW_COLORS[first];
	}
	return VERTICAL_RAW_COLORS.other;
}

const SVG_W = 900;
const SVG_H = 600;

// Background grid spacing in SVG units
const GRID_SPACING = 20;

export function DotGridMap({ startups, width = SVG_W, height = SVG_H }: DotGridMapProps) {
	// Background grid dots
	const gridDots = useMemo(() => {
		const dots: Array<{ x: number; y: number; key: string }> = [];
		for (let gx = GRID_SPACING; gx < width; gx += GRID_SPACING) {
			for (let gy = GRID_SPACING; gy < height; gy += GRID_SPACING) {
				dots.push({ x: gx, y: gy, key: `g-${gx}-${gy}` });
			}
		}
		return dots;
	}, [width, height]);

	// Americas continent dots
	const americasDots = useMemo(
		() =>
			AMERICAS_POINTS.map(([lat, lng]) => {
				const { x, y } = projectToSvg(lat, lng, width, height);
				return { x, y, key: `a-${lat}-${lng}` };
			}),
		[width, height],
	);

	// LATAM region dots (higher opacity)
	const latamDots = useMemo(
		() =>
			LATAM_POINTS.map(([lat, lng]) => {
				const { x, y } = projectToSvg(lat, lng, width, height);
				return { x, y, key: `l-${lat}-${lng}` };
			}),
		[width, height],
	);

	// Startup dots
	const startupDots = useMemo(
		() =>
			startups.map((s) => {
				const { x, y } = projectToSvg(s.lat, s.lng, width, height);
				const color = getStartupColor(s.verticals);
				return { x, y, color, slug: s.slug, name: s.name };
			}),
		[startups, width, height],
	);

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className="dot-grid-map"
			style={{
				width: "100%",
				height: "100%",
				position: "absolute",
				inset: 0,
			}}
			aria-hidden="true"
		>
			<defs>
				{/* Glow filter for startup dots */}
				<filter id="startup-glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="4" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* Layer 1: Background grid */}
			<g opacity="0.03">
				{gridDots.map((d) => (
					<circle key={d.key} cx={d.x} cy={d.y} r="1" fill="white" />
				))}
			</g>

			{/* Layer 2: Americas continent */}
			<g opacity="0.08">
				{americasDots.map((d) => (
					<circle key={d.key} cx={d.x} cy={d.y} r="2.5" fill="white" className="americas-dot" />
				))}
			</g>

			{/* Layer 3: LATAM region overlay */}
			<g opacity="0.15">
				{latamDots.map((d) => (
					<circle key={d.key} cx={d.x} cy={d.y} r="2.5" fill="white" className="latam-dot" />
				))}
			</g>

			{/* Layer 4: Startup dots */}
			<g>
				{startupDots.map((d) => (
					<g key={d.slug}>
						{/* Glow ring */}
						<circle
							cx={d.x}
							cy={d.y}
							r="6"
							fill={d.color}
							opacity="0.25"
							className="startup-glow-ring"
						/>
						{/* Core dot */}
						<circle cx={d.x} cy={d.y} r="3" fill={d.color} className="startup-dot" />
					</g>
				))}
			</g>

			<style>{`
				.americas-dot {
					animation: dot-pulse 6s ease-in-out infinite;
				}
				.latam-dot {
					animation: dot-pulse 6s ease-in-out infinite;
					animation-delay: 0.5s;
				}
				.startup-dot {
					animation: dot-breathe 3s ease-in-out infinite;
				}
				.startup-glow-ring {
					animation: glow-breathe 3s ease-in-out infinite;
				}
				@keyframes dot-pulse {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.6; }
				}
				@keyframes dot-breathe {
					0%, 100% { r: 3; }
					50% { r: 3.5; }
				}
				@keyframes glow-breathe {
					0%, 100% { r: 6; opacity: 0.25; }
					50% { r: 9; opacity: 0.12; }
				}
			`}</style>
		</svg>
	);
}

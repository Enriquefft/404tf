import { useMemo } from "react";
import { AMERICAS_POINTS, LATAM_POINTS, projectToSvg } from "@/lib/map-points";
import type { VerticalKey } from "@/lib/startup-schema";

type StartupDot = {
	slug: string;
	name: string;
	country: string;
	lat: number;
	lng: number;
	verticals: readonly VerticalKey[];
};

type DotGridMapProps = {
	startups: readonly StartupDot[];
	width?: number;
	height?: number;
	countLabel?: string;
};

/** CSS-variable-aware color lookup for inline styles */
const VERTICAL_RAW_COLORS: Record<VerticalKey, string> = {
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

function getStartupColor(verticals: readonly VerticalKey[]): string {
	const first = verticals[0];
	return first ? VERTICAL_RAW_COLORS[first] : VERTICAL_RAW_COLORS.other;
}

const SVG_W = 900;
const SVG_H = 600;

// Background grid spacing in SVG units
const GRID_SPACING = 20;

type CountryCluster = {
	country: string;
	count: number;
	centerX: number;
	centerY: number;
	radius: number;
};

export function DotGridMap({
	startups,
	width = SVG_W,
	height = SVG_H,
	countLabel = "startup",
}: DotGridMapProps) {
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

	// Startup dots (projected) with country attached for hover clustering
	const startupDots = useMemo(
		() =>
			startups.map((s) => {
				const { x, y } = projectToSvg(s.lat, s.lng, width, height);
				const color = getStartupColor(s.verticals);
				return { x, y, color, slug: s.slug, name: s.name, country: s.country };
			}),
		[startups, width, height],
	);

	// Cluster startups by country for the tooltip hover surface. Dots without
	// a country (e.g. pages still passing the legacy shape) are skipped so the
	// tooltip only ever surfaces a confirmed country name.
	const countryClusters = useMemo<CountryCluster[]>(() => {
		const groups = new Map<string, { xs: number[]; ys: number[] }>();
		for (const dot of startupDots) {
			if (!dot.country) continue;
			const bucket = groups.get(dot.country);
			if (bucket) {
				bucket.xs.push(dot.x);
				bucket.ys.push(dot.y);
			} else {
				groups.set(dot.country, { xs: [dot.x], ys: [dot.y] });
			}
		}
		return Array.from(groups.entries()).map(([country, { xs, ys }]) => {
			const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
			const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;
			// Radius scales with spread so single-dot countries still get a reasonable hit area
			let maxDist = 0;
			for (let i = 0; i < xs.length; i++) {
				const dx = (xs[i] ?? 0) - centerX;
				const dy = (ys[i] ?? 0) - centerY;
				const d = Math.sqrt(dx * dx + dy * dy);
				if (d > maxDist) maxDist = d;
			}
			const radius = Math.max(22, maxDist + 18);
			return { country, count: xs.length, centerX, centerY, radius };
		});
	}, [startupDots]);

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
			role="img"
			aria-label="LATAM deeptech startup map"
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
						<circle
							cx={d.x}
							cy={d.y}
							r="6"
							fill={d.color}
							opacity="0.25"
							className="startup-glow-ring"
						/>
						<circle cx={d.x} cy={d.y} r="3" fill={d.color} className="startup-dot" />
					</g>
				))}
			</g>

			{/* Layer 5: Country hover surfaces — SVG native <title> shows tooltip
			     on hover without JS state. Invisible circle wraps clustered
			     startup dots per country; browsers render the title natively. */}
			<g>
				{countryClusters.map((cluster) => (
					<circle
						key={`hit-${cluster.country}`}
						cx={cluster.centerX}
						cy={cluster.centerY}
						r={cluster.radius}
						fill="transparent"
						className="country-hit"
					>
						<title>
							{cluster.country.toUpperCase()} · {cluster.count} {countLabel}
							{cluster.count === 1 ? "" : "s"}
						</title>
					</circle>
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
				.country-hit {
					cursor: crosshair;
					pointer-events: all;
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
				@media (hover: none) {
					.country-hit { pointer-events: none; }
				}
			`}</style>
		</svg>
	);
}

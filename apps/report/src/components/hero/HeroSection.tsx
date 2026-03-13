import { useCallback, useState } from "react";
import { DotGridMap } from "./DotGridMap";
import type { VerticalKey } from "./data/verticals";
import { VERTICALS } from "./data/verticals";
import { HeroCTAs } from "./HeroCTAs";
import { HeroHeader } from "./HeroHeader";
import { HeroStatsBar } from "./HeroStatsBar";
import { VerticalFilterLegend } from "./VerticalFilterLegend";

export function HeroSection() {
	const [activeVerticals, setActiveVerticals] = useState<Set<VerticalKey>>(
		() => new Set(VERTICALS.map((v) => v.key)),
	);

	const handleToggle = useCallback((key: VerticalKey) => {
		setActiveVerticals((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			return next;
		});
	}, []);

	return (
		<section className="ds-grain" style={sectionStyles}>
			{/* Background gradient */}
			<div style={bgGradientStyles} />

			{/* Content layout */}
			<div style={contentStyles}>
				{/* Header area */}
				<div style={{ paddingTop: "2.5rem" }}>
					<HeroHeader />
				</div>

				{/* Map area with legend overlay */}
				<div style={mapContainerStyles}>
					<DotGridMap activeVerticals={activeVerticals} />
					<VerticalFilterLegend
						activeVerticals={activeVerticals}
						onToggle={handleToggle}
					/>
				</div>

				{/* Stats + CTAs area */}
				<div style={bottomStyles}>
					<HeroStatsBar />
					<HeroCTAs />
				</div>
			</div>
		</section>
	);
}

const sectionStyles: React.CSSProperties = {
	position: "relative",
	width: "100%",
	minHeight: "100vh",
	background: "var(--background)",
	overflow: "hidden",
};

const bgGradientStyles: React.CSSProperties = {
	position: "absolute",
	inset: 0,
	background:
		"radial-gradient(ellipse 80% 60% at 50% 40%, var(--primary-8) 0%, transparent 70%)",
	pointerEvents: "none",
};

const contentStyles: React.CSSProperties = {
	position: "relative",
	zIndex: 1,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	minHeight: "100vh",
	gap: "1rem",
	padding: "0 1.5rem 2rem",
};

const mapContainerStyles: React.CSSProperties = {
	position: "relative",
	flex: 1,
	width: "100%",
	maxWidth: "64rem",
	minHeight: 0,
};

const bottomStyles: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	gap: "1.25rem",
	paddingBottom: "1rem",
};

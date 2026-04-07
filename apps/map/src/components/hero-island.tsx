import { DotGridMap } from "@/components/dot-grid-map";
import { HeroStats } from "@/components/hero-stats";
import type { Locale } from "@/i18n/translations";
import type { VerticalKey } from "@/lib/seed-schema";

type StartupDot = {
	slug: string;
	name: string;
	lat: number;
	lng: number;
	verticals: readonly VerticalKey[];
};

type HeroIslandProps = {
	startups: StartupDot[];
	locale: Locale;
	statsData: {
		startupCount: number;
		countryCount: number;
		verticalCount: number;
	};
	labels: {
		heroSubtitle: string;
		heroSecondary: string;
		statsStartups: string;
		statsCountries: string;
		statsVerticals: string;
		scrollToExplore: string;
		ctaFindSolution: string;
		ctaGetOnMap: string;
	};
	directoryHref: string;
	startupsHref: string;
};

export function HeroIsland({ startups, statsData, labels, startupsHref }: HeroIslandProps) {
	const stats = [
		{ value: statsData.startupCount, suffix: "+", label: labels.statsStartups },
		{ value: statsData.countryCount, suffix: "", label: labels.statsCountries },
		{ value: statsData.verticalCount, suffix: "", label: labels.statsVerticals },
	];

	return (
		<div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden">
			{/* Map background */}
			<DotGridMap startups={startups} />

			{/* Gradient overlay for text readability */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(10, 7, 16, 0.7) 70%)",
				}}
			/>

			{/* Text overlay */}
			<div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center">
				{/* Title */}
				<h1
					className="text-5xl font-bold leading-none tracking-tight sm:text-7xl md:text-8xl"
					style={{
						fontFamily: "var(--font-display)",
						color: "var(--foreground)",
					}}
				>
					404 Mapped
				</h1>

				{/* Subtitle */}
				<p
					className="text-xl font-medium sm:text-2xl"
					style={{
						fontFamily: "var(--font-heading)",
						color: "var(--primary-light)",
					}}
				>
					{labels.heroSubtitle}
				</p>

				{/* Secondary */}
				<p
					className="max-w-lg text-base sm:text-lg"
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--muted-foreground)",
					}}
				>
					{labels.heroSecondary}
				</p>

				{/* Stats bar */}
				<HeroStats stats={stats} />

				{/* CTAs */}
				<div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-4">
					{/* Primary CTA — rendered via Astro slot, this is a placeholder for layout */}
					<div data-hero-cta-primary />

					{/* Secondary CTA */}
					<a
						href={startupsHref}
						className="inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 font-semibold transition-all duration-150 ease-out"
						style={{
							fontFamily: "var(--font-heading)",
							borderRadius: "var(--radius-md)",
							color: "var(--primary)",
							border: "1px solid var(--primary)",
							background: "transparent",
						}}
					>
						{labels.ctaGetOnMap}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M9 5l6 7-6 7" />
						</svg>
					</a>
				</div>
			</div>

			{/* Scroll indicator */}
			<div
				className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
				style={{ animation: "hero-bounce 2s ease-in-out infinite" }}
			>
				<span
					className="text-xs"
					style={{
						fontFamily: "var(--font-heading)",
						color: "var(--text-tertiary)",
					}}
				>
					{labels.scrollToExplore}
				</span>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					style={{ color: "var(--text-tertiary)" }}
					aria-hidden="true"
				>
					<path d="M5 9l7 7 7-7" />
				</svg>
			</div>

			<style>{`
				@keyframes hero-bounce {
					0%, 100% { transform: translateX(-50%) translateY(0); }
					50% { transform: translateX(-50%) translateY(6px); }
				}
			`}</style>
		</div>
	);
}

import { DotGridMap } from "@/components/dot-grid-map";
import { HeroStats } from "@/components/hero-stats";
import { getTranslations, type Locale } from "@/i18n/translations";
import type { VerticalKey } from "@/lib/startup-schema";

type StartupDot = {
	slug: string;
	name: string;
	/** Optional until pages are updated to pass it — the dot-grid tooltip
	 *  falls back gracefully when a country is missing. */
	country?: string;
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
		ctaFindSolution: string;
		ctaGetOnMap: string;
	};
	directoryHref: string;
	startupsHref: string;
};

export function HeroIsland({ startups, locale, statsData, labels, startupsHref }: HeroIslandProps) {
	// New Foundry-voice hero strings are sourced from translations directly so
	// the legacy `labels` prop stays backward-compatible with existing pages.
	const t = getTranslations(locale);
	const {
		heroKicker,
		heroEyebrow,
		heroManifesto,
		heroTrustLine,
		heroGetOnMapLink,
		mapTooltipCount,
	} = t.landing;

	const stats = [
		{ value: statsData.startupCount, suffix: "+", label: labels.statsStartups },
		{ value: statsData.countryCount, suffix: "", label: labels.statsCountries },
		{ value: statsData.verticalCount, suffix: "", label: labels.statsVerticals },
	];

	// Dot-grid expects a country per startup; use "" as a safe fallback if the
	// page hasn't been updated yet. Empty-country dots are still rendered and
	// cluster together under a single unlabeled hit zone that silently no-ops.
	const mapStartups = startups.map((s) => ({
		slug: s.slug,
		name: s.name,
		country: s.country ?? "",
		lat: s.lat,
		lng: s.lng,
		verticals: s.verticals,
	}));

	return (
		<div
			className="relative flex items-center justify-center overflow-hidden"
			style={{ minHeight: "calc(100vh - 3.5rem)" }}
		>
			{/* Map background */}
			<DotGridMap startups={mapStartups} countLabel={mapTooltipCount} />

			{/* Darkening overlay for text readability — linear fade, no atmospheric glow. */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"linear-gradient(to bottom, rgba(10, 7, 16, 0.35) 0%, rgba(10, 7, 16, 0.65) 55%, rgba(10, 7, 16, 0.9) 100%)",
				}}
			/>

			{/* Text overlay */}
			<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-7 px-4 py-16 text-center">
				{/* Kicker — mono uppercase, tight letter-spacing, amber */}
				<span
					className="inline-flex items-center gap-3 text-[10px] uppercase sm:text-xs"
					style={{
						fontFamily: "var(--font-mono)",
						color: "var(--secondary)",
						letterSpacing: "0.32em",
					}}
				>
					<span
						aria-hidden="true"
						className="inline-block h-px w-6"
						style={{ background: "var(--secondary)", opacity: 0.6 }}
					/>
					{heroKicker}
					<span
						aria-hidden="true"
						className="inline-block h-px w-6"
						style={{ background: "var(--secondary)", opacity: 0.6 }}
					/>
				</span>

				{/* Eyebrow — muted body caption above the monument */}
				<span
					className="-mt-3 text-sm sm:text-base"
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--muted-foreground)",
						letterSpacing: "0.02em",
					}}
				>
					{heroEyebrow}
				</span>

				{/* Monument title — 404 at display weight, "Mapped" as wordmark beside */}
				<h1
					className="flex flex-col items-center leading-[0.82] tracking-[-0.04em] sm:flex-row sm:items-end sm:gap-6"
					style={{
						fontFamily: "var(--font-display)",
						color: "var(--foreground)",
					}}
				>
					<span
						style={{
							color: "var(--secondary)",
							fontWeight: 800,
							fontSize: "clamp(7rem, 22vw, 15rem)",
							lineHeight: 0.82,
							fontFeatureSettings: "'tnum' 1",
						}}
					>
						404
					</span>
					<span
						style={{
							color: "var(--foreground)",
							fontWeight: 600,
							fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
							lineHeight: 0.9,
							letterSpacing: "-0.015em",
							textTransform: "uppercase",
							paddingBottom: "0.45em",
						}}
					>
						Mapped
					</span>
				</h1>

				{/* Manifesto — the sentence that stops the scroll */}
				<p
					className="max-w-2xl text-lg sm:text-xl md:text-2xl"
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--foreground)",
						lineHeight: 1.35,
						fontWeight: 500,
					}}
				>
					{heroManifesto}
				</p>

				{/* Stats bar */}
				<HeroStats stats={stats} />

				{/* CTA slot — single primary purple button (injected as absolute overlay
				    from the page; this placeholder reserves layout height so the
				    manifesto and trust line don't collapse onto the CTA). */}
				<div
					data-hero-cta-primary
					aria-hidden="true"
					className="h-11 w-full"
					style={{ visibility: "hidden" }}
				/>

				{/* Trust micro-line — audience clarity in muted mono */}
				<span
					className="text-[10px] uppercase sm:text-xs"
					style={{
						fontFamily: "var(--font-mono)",
						color: "var(--muted-foreground)",
						letterSpacing: "0.22em",
					}}
				>
					{heroTrustLine}
				</span>

				{/* Secondary — plain text link, not a styled button */}
				<a
					href={startupsHref}
					className="group inline-flex items-center gap-1.5 text-sm underline-offset-4 transition-colors duration-150 ease-out hover:underline"
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--muted-foreground)",
					}}
				>
					{heroGetOnMapLink}
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
						className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
					>
						<path d="M5 12h14" />
						<path d="M13 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	);
}

import type { Locale } from "@/i18n/translations";
import { getCountryFlag } from "@/lib/countries";
import { startups } from "@/lib/seed";
import { MATURITY_KEYS, type MaturityKey, type VerticalKey } from "@/lib/seed-schema";
import { MATURITY_CONFIG, VERTICAL_CONFIG } from "@/lib/verticals";

// ---------------------------------------------------------------------------
// Computed stats (all build-time, no runtime DB reads)
// ---------------------------------------------------------------------------

function isVerticalKey(k: string): k is VerticalKey {
	return Object.hasOwn(VERTICAL_CONFIG, k);
}

function isMaturityKey(k: string): k is MaturityKey {
	return Object.hasOwn(MATURITY_CONFIG, k);
}

export const totalStartups = startups.length;

const uniqueCountries = [...new Set(startups.map((s) => s.country))];
export const countryCount = uniqueCountries.length;

// Country distribution sorted descending by count
export const countryDistribution = Object.entries(
	startups.reduce<Record<string, number>>((acc, s) => {
		acc[s.country] = (acc[s.country] ?? 0) + 1;
		return acc;
	}, {}),
)
	.map(([country, count]) => ({
		country,
		count,
		flag: getCountryFlag(country),
	}))
	.sort((a, b) => b.count - a.count);

// Vertical distribution (a startup can have multiple verticals)
export const verticalDistribution = Object.entries(
	startups.reduce<Record<string, number>>((acc, s) => {
		for (const v of s.verticals) {
			acc[v] = (acc[v] ?? 0) + 1;
		}
		return acc;
	}, {}),
)
	.map(([vertical, count]) => {
		const config = isVerticalKey(vertical) ? VERTICAL_CONFIG[vertical] : null;
		return {
			vertical,
			count,
			label: config?.label ?? { en: vertical, es: vertical },
			color: config?.color ?? "var(--v-other)",
		};
	})
	.sort((a, b) => b.count - a.count);

// Maturity distribution
export const maturityDistribution = MATURITY_KEYS.map((key) => ({
	key,
	label: MATURITY_CONFIG[key].label,
	count: startups.filter((s) => s.maturity_level === key).length,
	percentage: Math.round(
		(startups.filter((s) => s.maturity_level === key).length / startups.length) * 100,
	),
}));

// Founding year timeline
const yearCounts = startups.reduce<Record<number, number>>((acc, s) => {
	if (s.founding_year) {
		acc[s.founding_year] = (acc[s.founding_year] ?? 0) + 1;
	}
	return acc;
}, {});

const allYears = Object.keys(yearCounts).map(Number);
const minYear = Math.min(...allYears);
const maxYear = Math.max(...allYears);

export const foundingTimeline: Array<{ year: number; count: number }> = [];
for (let y = minYear; y <= maxYear; y++) {
	foundingTimeline.push({ year: y, count: yearCounts[y] ?? 0 });
}

// Funding stats
function parseFunding(raw: string | null): number | null {
	if (!raw) return null;
	const cleaned = raw
		.replace(/US\$\s*/i, "")
		.replace(/\$/g, "")
		.replace(/,/g, "")
		.trim();
	const match = cleaned.match(/([\d.]+)\s*(M|K)?/i);
	if (!match) return null;
	const value = Number.parseFloat(match[1]);
	const unit = (match[2] ?? "").toUpperCase();
	if (unit === "M") return value * 1_000_000;
	if (unit === "K") return value * 1_000;
	return value;
}

const fundedStartups = startups.filter((s) => s.funding_received !== null);
const fundingAmounts = fundedStartups
	.map((s) => parseFunding(s.funding_received))
	.filter((v): v is number => v !== null);

export const fundingStats = {
	totalDisclosed: fundingAmounts.reduce((a, b) => a + b, 0),
	withFunding: fundedStartups.length,
	withFundingPct: Math.round((fundedStartups.length / startups.length) * 100),
	avgFunded:
		fundingAmounts.length > 0
			? fundingAmounts.reduce((a, b) => a + b, 0) / fundingAmounts.length
			: 0,
};

export function formatCurrency(value: number): string {
	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1_000) {
		return `$${(value / 1_000).toFixed(0)}K`;
	}
	return `$${value.toFixed(0)}`;
}

// Vertical label helper for charts
export function getVerticalLabel(key: string, locale: Locale): string {
	if (!isVerticalKey(key)) return key;
	return VERTICAL_CONFIG[key].label[locale];
}

// Maturity label helper
export function getMaturityLabel(key: string, locale: Locale): string {
	if (!isMaturityKey(key)) return key;
	return MATURITY_CONFIG[key].label[locale];
}

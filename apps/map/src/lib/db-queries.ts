import { z } from "zod";
import { getCountryFlag } from "@/lib/countries";
import {
	and,
	arrayContains,
	asc,
	db,
	eq,
	ilike,
	type MapStartup,
	mapStartups,
	ne,
	or,
	sql,
} from "@/lib/db";
import {
	MATURITY_KEYS,
	type MaturityKey,
	type StartupRecord,
	startupRecordSchema,
	type VerticalKey,
	verticalKeySchema,
} from "@/lib/startup-schema";
import { MATURITY_CONFIG, VERTICAL_CONFIG } from "@/lib/verticals";

// ---------------------------------------------------------------------------
// Request-time DB query layer. Every function here is stateless; caching is
// the CDN's job (pages set `Cache-Tag` + `s-maxage` / SWR headers, and admin
// mutations call /api/revalidate to invalidate). Do NOT memoize results in
// module scope — that would defeat revalidation.
// ---------------------------------------------------------------------------

// -- Internal: DB row -> StartupRecord projection -------------------------
//
// Input is typed as the exact Drizzle $inferSelect row. Output is validated
// through the Zod schema so malformed jsonb (key_results, social_links, etc.)
// fails loudly at the query boundary instead of silently rendering garbage.

function toStartupRecord(row: MapStartup): StartupRecord {
	const rawVerticals = row.verticals ?? [];
	const verticals: VerticalKey[] = [];
	for (const v of rawVerticals) {
		const parsed = verticalKeySchema.safeParse(v);
		if (parsed.success) verticals.push(parsed.data);
	}

	const input: Record<string, unknown> = {
		slug: row.slug,
		name: row.name,
		one_liner: row.oneLiner ?? "",
		one_liner_en: row.oneLinerEn ?? null,
		country: row.country,
		country_es: row.countryEs ?? row.country,
		city: row.city,
		lat: row.lat ?? 0,
		lng: row.lng ?? 0,
		verticals,
		maturity_level: row.maturityLevel ?? "prototype",
		founding_year: row.foundingYear ?? 0,
		tech_description: row.techDescription ?? null,
		tech_description_en: row.techDescriptionEn ?? null,
		key_results: row.keyResults ?? null,
		key_results_en: row.keyResultsEn ?? null,
		problem_statement: row.problemStatement ?? null,
		problem_statement_en: row.problemStatementEn ?? null,
		business_model: row.businessModel ?? null,
		business_model_en: row.businessModelEn ?? null,
		funding_received: row.fundingReceived ?? null,
		team_size: row.teamSize ?? null,
		website_url: row.websiteUrl ?? null,
		social_links: row.socialLinks ?? null,
		contact_name: row.contactName ?? null,
		contact_role: row.contactRole ?? null,
		contact_email: row.contactEmail ?? null,
		contact_phone: row.contactPhone ?? null,
		contact_linkedin: row.contactLinkedin ?? null,
		claimed: row.claimed ?? false,
		logo_path: row.logoPath ?? null,
		hero_image_path: row.heroImagePath ?? null,
		founder_photos: row.founderPhotos ?? null,
		partner_logos: row.partnerLogos ?? null,
		video_url: row.videoUrl ?? null,
		video_label: row.videoLabel ?? null,
	};

	const parsed = startupRecordSchema.safeParse(input);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.slice(0, 5)
			.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
			.join("\n");
		throw new Error(`Row "${row.slug}" failed StartupRecord validation:\n${issues}`);
	}
	return parsed.data;
}

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

export async function getAllStartups(): Promise<StartupRecord[]> {
	const rows = await db.select().from(mapStartups).orderBy(asc(mapStartups.name));
	return rows.map(toStartupRecord);
}

export async function getStartupBySlug(slug: string): Promise<StartupRecord | null> {
	const rows = await db.select().from(mapStartups).where(eq(mapStartups.slug, slug)).limit(1);
	const [row] = rows;
	if (!row) return null;
	return toStartupRecord(row);
}

export async function getRelatedStartups(
	currentSlug: string,
	verticals: readonly VerticalKey[],
	limit = 3,
): Promise<StartupRecord[]> {
	if (verticals.length === 0) return [];

	// Match any startup whose `verticals` array contains ANY of the provided
	// verticals (via an OR of arrayContains checks) and exclude the current
	// slug. Drizzle's `arrayContains` renders as `@>` which works for single-
	// element membership queries.
	const verticalMatches = or(...verticals.map((v) => arrayContains(mapStartups.verticals, [v])));

	const rows = await db
		.select()
		.from(mapStartups)
		.where(and(verticalMatches, ne(mapStartups.slug, currentSlug)))
		.orderBy(asc(mapStartups.name))
		.limit(limit);

	return rows.map(toStartupRecord);
}

export async function getUniqueCountries(): Promise<string[]> {
	const rows = await db
		.selectDistinct({ country: mapStartups.country })
		.from(mapStartups)
		.orderBy(asc(mapStartups.country));
	return rows.map((r) => r.country);
}

export async function getUniqueVerticals(): Promise<VerticalKey[]> {
	// verticals is a text[] column — fetch it, flatten in JS, dedupe via Set,
	// and validate each value against the DB enum before returning. Doing it
	// here (rather than with SQL `unnest`) keeps the function portable across
	// drizzle drivers and avoids a raw SQL escape hatch.
	const rows = await db.select({ verticals: mapStartups.verticals }).from(mapStartups);
	const seen = new Set<VerticalKey>();
	for (const row of rows) {
		for (const v of row.verticals ?? []) {
			const parsed = verticalKeySchema.safeParse(v);
			if (parsed.success) seen.add(parsed.data);
		}
	}
	return [...seen].sort();
}

// ---------------------------------------------------------------------------
// Directory pagination
// ---------------------------------------------------------------------------

export const directoryQueryOptsSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(50).default(20),
	verticals: z.array(verticalKeySchema).default([]),
	country: z.string().max(80).optional(),
	maturity: z.enum(MATURITY_KEYS).optional(),
	search: z.string().max(100).optional(),
	sort: z.enum(["az", "newest"]).default("az"),
});

export type DirectoryQueryOpts = z.input<typeof directoryQueryOptsSchema>;
export type DirectoryPageResult = {
	startups: StartupRecord[];
	total: number;
};

export async function getDirectoryPage(opts: DirectoryQueryOpts): Promise<DirectoryPageResult> {
	const parsed = directoryQueryOptsSchema.parse(opts);
	const { page, pageSize, verticals, country, maturity, search, sort } = parsed;

	const conditions = [];

	if (search && search.length > 0) {
		conditions.push(
			or(
				ilike(mapStartups.name, `%${search}%`),
				ilike(mapStartups.oneLiner, `%${search}%`),
				ilike(mapStartups.oneLinerEn, `%${search}%`),
			),
		);
	}

	if (verticals.length > 0) {
		conditions.push(or(...verticals.map((v) => arrayContains(mapStartups.verticals, [v]))));
	}

	if (country && country.length > 0) {
		conditions.push(eq(mapStartups.country, country));
	}

	if (maturity) {
		conditions.push(eq(mapStartups.maturityLevel, maturity));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;
	const orderBy =
		sort === "newest" ? sql`${mapStartups.foundingYear} DESC NULLS LAST` : asc(mapStartups.name);
	const offset = (page - 1) * pageSize;

	const [rows, countResult] = await Promise.all([
		db.select().from(mapStartups).where(where).orderBy(orderBy).limit(pageSize).offset(offset),
		db.select({ count: sql<number>`count(*)::int` }).from(mapStartups).where(where),
	]);

	return {
		startups: rows.map(toStartupRecord),
		total: countResult[0]?.count ?? 0,
	};
}

// ---------------------------------------------------------------------------
// Insights aggregate
// Replaces the old build-time `src/lib/insights-data.ts`. Computed on every
// request against the full startup list — the DB is small (target 200–400
// rows) so a single SELECT + in-memory reductions is faster than multiple
// aggregation queries and keeps the logic readable.
// ---------------------------------------------------------------------------

function isVerticalKey(k: string): k is VerticalKey {
	return Object.hasOwn(VERTICAL_CONFIG, k);
}

export function parseFunding(raw: string | null): number | null {
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

export function formatCurrency(value: number): string {
	if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
	return `$${value.toFixed(0)}`;
}

// Template interpolation for editorial copy. Translation strings contain
// `{token}` placeholders; resolved here so a single metric dictionary feeds
// both locales without duplicated formatting logic per page.
export function fillTemplate(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
		const v = values[key];
		return v === undefined ? `{${key}}` : String(v);
	});
}

export type CountryDistribution = {
	country: string;
	count: number;
	flag: string;
};

export type VerticalDistribution = {
	vertical: string;
	count: number;
	label: { en: string; es: string };
	color: string;
};

export type MaturityDistribution = {
	key: MaturityKey;
	label: { en: string; es: string };
	count: number;
	percentage: number;
};

export type FoundingTimelinePoint = { year: number; count: number };

export type FundingStats = {
	totalDisclosed: number;
	withFunding: number;
	withFundingPct: number;
	avgFunded: number;
};

export type GeoInsight = {
	leaderCountry: string;
	leaderCountryEs: string;
	leaderCount: number;
	secondCountry: string | null;
	secondCountryEs: string | null;
	secondCount: number;
	leaderMultiple: number;
	totalCount: number;
};

export type VerticalInsight = {
	leaderKey: string;
	leaderLabelEs: string;
	leaderLabelEn: string;
	leaderCount: number;
	topThreeShare: number;
	countsUnderTen: number;
};

export type FoundingInsight = {
	peakYear: number;
	peakCount: number;
	lastFiveYearShare: number;
	minYear: number;
	maxYear: number;
};

export type MaturityInsight = {
	earlyStagePct: number;
	commercialPct: number;
	rdCount: number;
	prototypeCount: number;
};

export type FundingInsight = {
	topThreeShare: number;
	disclosedPct: number;
	topStartupNames: string[];
};

export type InsightsData = {
	totalStartups: number;
	countryCount: number;
	countryDistribution: CountryDistribution[];
	verticalDistribution: VerticalDistribution[];
	foundingTimeline: FoundingTimelinePoint[];
	maturityDistribution: MaturityDistribution[];
	fundingStats: FundingStats;
	geoInsight: GeoInsight;
	verticalInsight: VerticalInsight;
	foundingInsight: FoundingInsight;
	maturityInsight: MaturityInsight;
	fundingInsight: FundingInsight;
};

export async function getInsightsData(): Promise<InsightsData> {
	const startups = await getAllStartups();
	const totalStartups = startups.length;

	// Country distribution sorted descending.
	const countryCounts = startups.reduce<Record<string, number>>((acc, s) => {
		acc[s.country] = (acc[s.country] ?? 0) + 1;
		return acc;
	}, {});
	const countryDistribution: CountryDistribution[] = Object.entries(countryCounts)
		.map(([country, count]) => ({
			country,
			count,
			flag: getCountryFlag(country),
		}))
		.sort((a, b) => b.count - a.count);

	// Vertical distribution (multi-vertical per startup).
	const verticalCounts = startups.reduce<Record<string, number>>((acc, s) => {
		for (const v of s.verticals) acc[v] = (acc[v] ?? 0) + 1;
		return acc;
	}, {});
	const verticalDistribution: VerticalDistribution[] = Object.entries(verticalCounts)
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

	// Maturity distribution across the four enum values.
	const maturityDistribution: MaturityDistribution[] = MATURITY_KEYS.map((key) => {
		const count = startups.filter((s) => s.maturity_level === key).length;
		return {
			key,
			label: MATURITY_CONFIG[key].label,
			count,
			percentage: totalStartups > 0 ? Math.round((count / totalStartups) * 100) : 0,
		};
	});

	// Founding-year timeline: fill every year in [min,max] with 0s.
	const yearCounts = startups.reduce<Record<number, number>>((acc, s) => {
		if (s.founding_year) {
			acc[s.founding_year] = (acc[s.founding_year] ?? 0) + 1;
		}
		return acc;
	}, {});
	const allYears = Object.keys(yearCounts).map(Number);
	const foundingTimeline: FoundingTimelinePoint[] = [];
	if (allYears.length > 0) {
		const minYear = Math.min(...allYears);
		const maxYear = Math.max(...allYears);
		for (let y = minYear; y <= maxYear; y++) {
			foundingTimeline.push({ year: y, count: yearCounts[y] ?? 0 });
		}
	}

	// Funding stats.
	const fundedStartups = startups.filter((s) => s.funding_received !== null);
	const fundingAmounts = fundedStartups
		.map((s) => parseFunding(s.funding_received))
		.filter((v): v is number => v !== null);
	const fundingStats: FundingStats = {
		totalDisclosed: fundingAmounts.reduce((a, b) => a + b, 0),
		withFunding: fundedStartups.length,
		withFundingPct:
			totalStartups > 0 ? Math.round((fundedStartups.length / totalStartups) * 100) : 0,
		avgFunded:
			fundingAmounts.length > 0
				? fundingAmounts.reduce((a, b) => a + b, 0) / fundingAmounts.length
				: 0,
	};

	// Geo insight: leader vs runner-up.
	const leader = countryDistribution[0];
	const second = countryDistribution[1];
	const leaderEs =
		startups.find((s) => s.country === leader?.country)?.country_es ?? leader?.country ?? "";
	const secondEs = second
		? (startups.find((s) => s.country === second.country)?.country_es ?? second.country)
		: null;
	const leaderMultiple =
		leader && second && second.count > 0 ? Math.round((leader.count / second.count) * 10) / 10 : 0;
	const geoInsight: GeoInsight = {
		leaderCountry: leader?.country ?? "",
		leaderCountryEs: leaderEs,
		leaderCount: leader?.count ?? 0,
		secondCountry: second?.country ?? null,
		secondCountryEs: secondEs,
		secondCount: second?.count ?? 0,
		leaderMultiple,
		totalCount: totalStartups,
	};

	// Vertical insight.
	const [vLeader] = verticalDistribution;
	const topThreeSum = verticalDistribution.slice(0, 3).reduce((sum, v) => sum + v.count, 0);
	const totalVerticalCount = verticalDistribution.reduce((sum, v) => sum + v.count, 0);
	const underTen = verticalDistribution.filter((v) => v.count < 10).length;
	const verticalInsight: VerticalInsight = {
		leaderKey: vLeader?.vertical ?? "",
		leaderLabelEs: vLeader?.label.es ?? "",
		leaderLabelEn: vLeader?.label.en ?? "",
		leaderCount: vLeader?.count ?? 0,
		topThreeShare:
			totalVerticalCount > 0 ? Math.round((topThreeSum / totalVerticalCount) * 100) : 0,
		countsUnderTen: underTen,
	};

	// Founding insight: peak year + last-five-year share.
	const foundingInsight = buildFoundingInsight(foundingTimeline);

	// Maturity insight.
	const byKey = new Map(maturityDistribution.map((m) => [m.key, m] as const));
	const rd = byKey.get("rd");
	const proto = byKey.get("prototype");
	const pilot = byKey.get("pilot");
	const rev = byKey.get("revenue");
	const maturityInsight: MaturityInsight = {
		earlyStagePct: (rd?.percentage ?? 0) + (proto?.percentage ?? 0),
		commercialPct: (pilot?.percentage ?? 0) + (rev?.percentage ?? 0),
		rdCount: rd?.count ?? 0,
		prototypeCount: proto?.count ?? 0,
	};

	// Funding insight: top-three share of disclosed amount + leaders.
	const ranked = startups
		.map((s) => ({ name: s.name, amount: parseFunding(s.funding_received) }))
		.filter((x): x is { name: string; amount: number } => x.amount !== null)
		.sort((a, b) => b.amount - a.amount);
	const rankedTotal = ranked.reduce((sum, r) => sum + r.amount, 0);
	const topThreeTotal = ranked.slice(0, 3).reduce((sum, r) => sum + r.amount, 0);
	const fundingInsight: FundingInsight = {
		topThreeShare: rankedTotal > 0 ? Math.round((topThreeTotal / rankedTotal) * 100) : 0,
		disclosedPct: fundingStats.withFundingPct,
		topStartupNames: ranked.slice(0, 3).map((r) => r.name),
	};

	return {
		totalStartups,
		countryCount: Object.keys(countryCounts).length,
		countryDistribution,
		verticalDistribution,
		foundingTimeline,
		maturityDistribution,
		fundingStats,
		geoInsight,
		verticalInsight,
		foundingInsight,
		maturityInsight,
		fundingInsight,
	};
}

function buildFoundingInsight(timeline: FoundingTimelinePoint[]): FoundingInsight {
	if (timeline.length === 0) {
		return {
			peakYear: 0,
			peakCount: 0,
			lastFiveYearShare: 0,
			minYear: 0,
			maxYear: 0,
		};
	}
	let peak = timeline[0];
	if (!peak) {
		return {
			peakYear: 0,
			peakCount: 0,
			lastFiveYearShare: 0,
			minYear: 0,
			maxYear: 0,
		};
	}
	for (const p of timeline) {
		if (p.count > peak.count) peak = p;
	}
	const foundedTotal = timeline.reduce((sum, p) => sum + p.count, 0);
	const lastFiveYears = timeline
		.filter((p) => p.year >= peak.year - 4)
		.reduce((sum, p) => sum + p.count, 0);
	return {
		peakYear: peak.year,
		peakCount: peak.count,
		lastFiveYearShare: foundedTotal > 0 ? Math.round((lastFiveYears / foundedTotal) * 100) : 0,
		minYear: Math.min(...timeline.map((p) => p.year)),
		maxYear: Math.max(...timeline.map((p) => p.year)),
	};
}

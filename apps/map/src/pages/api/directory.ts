import { mapStartups } from "@404tf/database/schema";
import type { APIRoute } from "astro";
import { and, arrayContains, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { directoryQuerySchema } from "@/lib/directory-query-schema";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const raw = Object.fromEntries(url.searchParams);
	const parsed = directoryQuerySchema.safeParse(raw);

	if (!parsed.success) {
		return new Response(JSON.stringify({ error: "Invalid query parameters" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { q, vertical, country, maturity, sort, page, limit } = parsed.data;

	const conditions = [];

	if (q) {
		conditions.push(
			or(
				ilike(mapStartups.name, `%${q}%`),
				ilike(mapStartups.oneLiner, `%${q}%`),
				ilike(mapStartups.oneLinerEn, `%${q}%`),
			),
		);
	}

	if (vertical) {
		conditions.push(arrayContains(mapStartups.verticals, [vertical]));
	}

	if (country) {
		conditions.push(eq(mapStartups.country, country));
	}

	if (maturity) {
		conditions.push(
			eq(mapStartups.maturityLevel, maturity as "rd" | "prototype" | "pilot" | "revenue"),
		);
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const orderBy =
		sort === "newest"
			? sql`${mapStartups.foundingYear} DESC NULLS LAST`
			: sql`${mapStartups.name} ASC`;

	const offset = (page - 1) * limit;

	const [data, countResult] = await Promise.all([
		db
			.select({
				slug: mapStartups.slug,
				name: mapStartups.name,
				one_liner: mapStartups.oneLiner,
				one_liner_en: mapStartups.oneLinerEn,
				country: mapStartups.country,
				country_es: mapStartups.countryEs,
				city: mapStartups.city,
				lat: mapStartups.lat,
				lng: mapStartups.lng,
				verticals: mapStartups.verticals,
				maturity_level: mapStartups.maturityLevel,
				founding_year: mapStartups.foundingYear,
				funding_received: mapStartups.fundingReceived,
			})
			.from(mapStartups)
			.where(where)
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset),
		db.select({ count: sql<number>`count(*)::int` }).from(mapStartups).where(where),
	]);

	const total = countResult[0]?.count ?? 0;

	return new Response(
		JSON.stringify({
			data,
			total,
			page,
			totalPages: Math.ceil(total / limit),
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
				"Cache-Control": "public, max-age=0, must-revalidate",
			},
		},
	);
};

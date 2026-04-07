import { and, arrayContains, eq, ilike, or, sql } from "@404tf/database";
import { mapStartups } from "@404tf/database/schema";
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { directoryQuerySchema } from "@/lib/directory-query-schema";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const raw = Object.fromEntries(url.searchParams);
	const parsed = directoryQuerySchema.safeParse(raw);

	if (!parsed.success) {
		return new Response(
			JSON.stringify({ error: "Invalid query parameters", details: parsed.error.issues }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	const { q, verticals, country, maturity, sort, page, limit } = parsed.data;

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

	if (verticals.length > 0) {
		// OR across selected verticals — startup matches if it has ANY of them
		conditions.push(or(...verticals.map((v) => arrayContains(mapStartups.verticals, [v]))));
	}

	if (country) {
		conditions.push(eq(mapStartups.country, country));
	}

	if (maturity) {
		// `maturity` is now a typed enum literal from Zod — no cast needed
		conditions.push(eq(mapStartups.maturityLevel, maturity));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const orderBy =
		sort === "newest"
			? sql`${mapStartups.foundingYear} DESC NULLS LAST`
			: sql`${mapStartups.name} ASC`;

	const offset = (page - 1) * limit;

	try {
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
					// 5min CDN cache covers the time between content updates and the
					// next deploy-hook rebuild. SWR=1h means stale results are still
					// served (with a background refresh) if the origin has a hiccup,
					// keeping the directory available during a Neon blip.
					"CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
					"Cache-Control": "public, max-age=0, must-revalidate",
				},
			},
		);
	} catch (err: unknown) {
		console.error("[api/directory] query failed:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

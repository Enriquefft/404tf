import type { APIRoute } from "astro";
import { CACHE_TAGS, joinCacheTags } from "@/lib/cache-tags";
import { getDirectoryPage } from "@/lib/db-queries";
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

	try {
		const { startups, total } = await getDirectoryPage({
			page,
			pageSize: limit,
			verticals,
			country: country === "" ? undefined : country,
			maturity: maturity === "" ? undefined : maturity,
			search: q === "" ? undefined : q,
			sort,
		});

		// Project to the thin response shape the client expects. We intentionally
		// drop heavy fields (key_results, partner_logos, etc.) to keep the API
		// payload small — the full record is fetched only on the detail page.
		const data = startups.map((s) => ({
			slug: s.slug,
			name: s.name,
			one_liner: s.one_liner,
			one_liner_en: s.one_liner_en,
			country: s.country,
			country_es: s.country_es,
			city: s.city,
			lat: s.lat,
			lng: s.lng,
			verticals: [...s.verticals],
			maturity_level: s.maturity_level,
			founding_year: s.founding_year,
			funding_received: s.funding_received,
		}));

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
					// next revalidation call. SWR=1h means stale results are still
					// served (with a background refresh) if the origin has a hiccup,
					// keeping the directory available during a Neon blip.
					"CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
					"Cache-Control": "public, max-age=0, must-revalidate",
					"Cache-Tag": joinCacheTags([CACHE_TAGS.directory, CACHE_TAGS.startupAll]),
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

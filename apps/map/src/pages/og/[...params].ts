import type { APIRoute } from "astro";
import { z } from "zod";
import { renderOgImage } from "@/lib/og-image";

export const prerender = false;

const querySchema = z.object({
	kind: z.enum(["landing", "directorio", "startup", "insights"]).default("landing"),
	locale: z.enum(["es", "en"]).default("es"),
	title: z.string().trim().min(1).max(120).optional(),
	subtitle: z.string().trim().min(1).max(240).optional(),
	metric: z.string().trim().min(1).max(40).optional(),
});

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const raw = Object.fromEntries(url.searchParams);
	const parsed = querySchema.safeParse(raw);

	if (!parsed.success) {
		return new Response(
			JSON.stringify({ error: "Invalid parameters", details: parsed.error.issues }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	try {
		const png = await renderOgImage(parsed.data);
		return new Response(new Uint8Array(png), {
			status: 200,
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "OG render failed";
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

import { timingSafeEqual } from "node:crypto";
import type { APIRoute } from "astro";
import { apiEnv } from "@/lib/api-env";

export const prerender = false;

const BEARER_PREFIX = "Bearer ";

function constantTimeEqual(a: string, b: string): boolean {
	const aBuf = Buffer.from(a);
	const bBuf = Buffer.from(b);
	if (aBuf.length !== bBuf.length) {
		// Still do a comparison so timing is independent of length match
		timingSafeEqual(aBuf, aBuf);
		return false;
	}
	return timingSafeEqual(aBuf, bBuf);
}

export const POST: APIRoute = async ({ request }) => {
	const expectedToken = apiEnv.ADMIN_REBUILD_TOKEN;
	const hookUrl = apiEnv.VERCEL_DEPLOY_HOOK_URL;

	if (!expectedToken || !hookUrl) {
		// Don't reveal which one is missing in the response; log internally.
		console.error("[admin/rebuild] missing ADMIN_REBUILD_TOKEN or VERCEL_DEPLOY_HOOK_URL");
		return new Response(JSON.stringify({ error: "Not configured" }), {
			status: 503,
			headers: { "Content-Type": "application/json" },
		});
	}

	const authHeader = request.headers.get("authorization") ?? "";
	const presented = authHeader.startsWith(BEARER_PREFIX)
		? authHeader.slice(BEARER_PREFIX.length)
		: "";

	if (!constantTimeEqual(presented, expectedToken)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const result = await fetch(hookUrl, { method: "POST" });
		return new Response(JSON.stringify({ triggered: result.ok }), {
			status: result.ok ? 200 : 502,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: unknown) {
		console.error("[admin/rebuild] deploy hook fetch failed:", err);
		return new Response(JSON.stringify({ error: "Deploy hook unreachable" }), {
			status: 502,
			headers: { "Content-Type": "application/json" },
		});
	}
};

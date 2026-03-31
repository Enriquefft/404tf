import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const authHeader = request.headers.get("authorization");
	const expectedToken = import.meta.env.ADMIN_REBUILD_TOKEN;

	if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const hookUrl = import.meta.env.VERCEL_DEPLOY_HOOK_URL;
	if (!hookUrl) {
		return new Response(JSON.stringify({ error: "Deploy hook not configured" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	const result = await fetch(hookUrl, { method: "POST" });

	return new Response(JSON.stringify({ triggered: result.ok }), {
		status: result.ok ? 200 : 502,
		headers: { "Content-Type": "application/json" },
	});
};

import { timingSafeEqual } from "node:crypto";
import type { APIRoute } from "astro";
import { z } from "zod";
import { apiEnv } from "@/lib/api-env";

// POST /api/revalidate
// ---------------------------------------------------------------------------
// Admin-only endpoint that invalidates Vercel CDN cache entries by tag.
// Replaces the previous /api/admin/rebuild full-site rebuild: pages now SSR
// from Neon with `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`
// + a `Vercel-Cache-Tag` response header, so editing one startup invalidates
// only that startup's cached HTML instead of redeploying the entire project.
//
// Auth: Bearer token in the Authorization header, constant-time compared.
// Body: { tags?: string[], paths?: string[] } — at least one must be non-empty.
//   - `tags`: opaque cache-tag strings that must match what SSR pages emit.
//             Use constants from `@/lib/cache-tags` in both sides to prevent
//             drift.
//   - `paths`: URL paths like "/en/directory". Vercel CDN has no first-class
//             path invalidation, so we emit them as tags of the form
//             `path:<path>`. SSR pages that want to be invalidatable by path
//             must include the matching `path:<path>` tag in their
//             `Vercel-Cache-Tag` header.
//
// Upstream endpoint: POST https://api.vercel.com/v1/edge-cache/invalidate-by-tags
// Upstream limit: 16 tags per call — we chunk automatically.
// Upstream docs: https://vercel.com/docs/rest-api/reference/endpoints/edge-cache/invalidate-by-tag
//
// Manual test (requires ADMIN_REBUILD_TOKEN + Vercel env vars set):
//   curl -X POST https://map.404tf.com/api/revalidate \
//     -H "Authorization: Bearer $ADMIN_REBUILD_TOKEN" \
//     -H "Content-Type: application/json" \
//     -d '{"tags": ["startup-notco", "directory"]}'

export const prerender = false;

const BEARER_PREFIX = "Bearer ";
const VERCEL_API_URL = "https://api.vercel.com/v1/edge-cache/invalidate-by-tags";
const VERCEL_MAX_TAGS_PER_CALL = 16;
const PATH_TAG_PREFIX = "path:";

const revalidateBodySchema = z
	.object({
		tags: z.array(z.string().min(1).max(256)).max(128).optional(),
		paths: z.array(z.string().min(1).max(256)).max(128).optional(),
	})
	.refine((data) => (data.tags?.length ?? 0) > 0 || (data.paths?.length ?? 0) > 0, {
		message: "At least one of `tags` or `paths` must be a non-empty array.",
	});

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

function jsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		out.push(arr.slice(i, i + size));
	}
	return out;
}

interface VercelPurgeError {
	tags: string[];
	status: number;
	message: string;
}

async function invalidateBatch(
	tags: string[],
	token: string,
	projectId: string,
	teamId: string | undefined,
): Promise<VercelPurgeError | null> {
	const params = new URLSearchParams({ projectIdOrName: projectId });
	if (teamId) params.set("teamId", teamId);
	const url = `${VERCEL_API_URL}?${params.toString()}`;

	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ tags }),
		});
		if (res.ok) return null;
		const text = await res.text().catch(() => "");
		return {
			tags,
			status: res.status,
			message: text.slice(0, 500) || res.statusText,
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Network error";
		return { tags, status: 0, message };
	}
}

export const POST: APIRoute = async ({ request }) => {
	const expectedToken = apiEnv.ADMIN_REBUILD_TOKEN;
	const vercelToken = apiEnv.VERCEL_API_TOKEN;
	const projectId = apiEnv.VERCEL_PROJECT_ID;
	const teamId = apiEnv.VERCEL_TEAM_ID;

	if (!expectedToken || !vercelToken || !projectId) {
		// Don't reveal which one is missing in the response; log internally.
		console.error(
			"[api/revalidate] missing ADMIN_REBUILD_TOKEN, VERCEL_API_TOKEN, or VERCEL_PROJECT_ID",
		);
		return jsonResponse(503, { error: "Not configured" });
	}

	const authHeader = request.headers.get("authorization") ?? "";
	const presented = authHeader.startsWith(BEARER_PREFIX)
		? authHeader.slice(BEARER_PREFIX.length)
		: "";

	if (!constantTimeEqual(presented, expectedToken)) {
		return jsonResponse(401, { error: "Unauthorized" });
	}

	let rawBody: unknown;
	try {
		rawBody = await request.json();
	} catch {
		return jsonResponse(400, { error: "Invalid JSON body" });
	}

	const parsed = revalidateBodySchema.safeParse(rawBody);
	if (!parsed.success) {
		return jsonResponse(400, {
			error: "Validation failed",
			issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
		});
	}

	const requestedTags = parsed.data.tags ?? [];
	const requestedPaths = parsed.data.paths ?? [];
	const pathTags = requestedPaths.map((p) => `${PATH_TAG_PREFIX}${p}`);
	const allTags = [...new Set([...requestedTags, ...pathTags])];

	const batches = chunk(allTags, VERCEL_MAX_TAGS_PER_CALL);
	const batchResults = await Promise.all(
		batches.map((batch) => invalidateBatch(batch, vercelToken, projectId, teamId)),
	);
	const errors = batchResults.filter((r): r is VercelPurgeError => r !== null);

	if (errors.length === batches.length && batches.length > 0) {
		// Every batch failed — surface as upstream error so callers can retry.
		console.error("[api/revalidate] all batches failed:", errors);
		return jsonResponse(502, {
			error: "Vercel purge failed",
			invalidated: { tags: [], paths: [] },
			errors,
		});
	}

	const failedTagSet = new Set<string>();
	for (const err of errors) for (const t of err.tags) failedTagSet.add(t);

	const succeededTags = requestedTags.filter((t) => !failedTagSet.has(t));
	const succeededPaths = requestedPaths.filter((p) => !failedTagSet.has(`${PATH_TAG_PREFIX}${p}`));

	return jsonResponse(200, {
		invalidated: { tags: succeededTags, paths: succeededPaths },
		errors,
	});
};

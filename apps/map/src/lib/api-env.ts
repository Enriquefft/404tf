import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Validated environment for API routes. Single source of truth — every
// `import.meta.env.X` access in /api should go through this. Missing required
// secrets fail fast at module load instead of silently degrading at runtime.
//
// PostHog client keys (PUBLIC_*) are intentionally NOT here — they're only
// referenced by client-side analytics, never by API routes.

export const apiEnv = createEnv({
	server: {
		// Auth for the /api/revalidate endpoint. Optional at boot so the route
		// returns 503 cleanly if it's not configured (instead of crashing the
		// whole API surface), but min(32) when present to prevent weak tokens.
		// Name kept as `ADMIN_REBUILD_TOKEN` for backward-compat with existing
		// Vercel project env; semantics are now "auth the revalidate endpoint".
		ADMIN_REBUILD_TOKEN: z.string().min(32).optional(),
		// Vercel REST API token (https://vercel.com/account/tokens) used to
		// issue tag-based CDN invalidations. Optional at boot for the same
		// reason as ADMIN_REBUILD_TOKEN — the revalidate route self-reports 503
		// when either is missing rather than crashing the whole API surface.
		VERCEL_API_TOKEN: z.string().min(1).optional(),
		// Project ID from Vercel project settings. Scopes which project's
		// CDN cache gets invalidated.
		VERCEL_PROJECT_ID: z.string().min(1).optional(),
		// Team ID (optional). Required only when the project lives under a
		// team scope; personal-scope projects omit this.
		VERCEL_TEAM_ID: z.string().min(1).optional(),
		// Resend transactional email. Optional so local dev without RESEND_API_KEY
		// still boots; the form routes individually no-op when it's missing.
		RESEND_API_KEY: z.string().min(1).optional(),
		RESEND_NOTIFY_TO: z.email().optional(),
	},
	runtimeEnv: {
		ADMIN_REBUILD_TOKEN: import.meta.env.ADMIN_REBUILD_TOKEN,
		VERCEL_API_TOKEN: import.meta.env.VERCEL_API_TOKEN,
		VERCEL_PROJECT_ID: import.meta.env.VERCEL_PROJECT_ID,
		VERCEL_TEAM_ID: import.meta.env.VERCEL_TEAM_ID,
		RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
		RESEND_NOTIFY_TO: import.meta.env.RESEND_NOTIFY_TO,
	},
	emptyStringAsUndefined: true,
});

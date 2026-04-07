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
		// Auth for the deploy-rebuild webhook. Optional at boot so the route
		// returns 503 cleanly if it's not configured (instead of crashing the
		// whole API surface), but min(32) when present to prevent weak tokens.
		ADMIN_REBUILD_TOKEN: z.string().min(32).optional(),
		VERCEL_DEPLOY_HOOK_URL: z.url().optional(),
		// Resend transactional email. Optional so local dev without RESEND_API_KEY
		// still boots; the form routes individually no-op when it's missing.
		RESEND_API_KEY: z.string().min(1).optional(),
		RESEND_NOTIFY_TO: z.email().optional(),
	},
	runtimeEnv: {
		ADMIN_REBUILD_TOKEN: import.meta.env.ADMIN_REBUILD_TOKEN,
		VERCEL_DEPLOY_HOOK_URL: import.meta.env.VERCEL_DEPLOY_HOOK_URL,
		RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
		RESEND_NOTIFY_TO: import.meta.env.RESEND_NOTIFY_TO,
	},
	emptyStringAsUndefined: true,
});

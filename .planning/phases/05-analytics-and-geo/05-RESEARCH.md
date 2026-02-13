# Phase 5: Analytics & GEO - Research

**Researched:** 2026-02-12
**Domain:** Analytics Integration, AI Discoverability, Performance Optimization, Production Readiness
**Confidence:** HIGH

## Summary

Phase 5 implements analytics tracking (PostHog), AI discoverability (llms.txt standard), performance verification (Core Web Vitals), and production readiness checks (error/loading states, 404 page). The standard stack is well-established with clear patterns for Next.js 16 App Router integration.

PostHog integration follows a provider pattern where a Client Component wraps Server Components, initializing the SDK with `capture_pageview: false` and manually tracking pageviews via `usePathname`/`useSearchParams` hooks wrapped in Suspense boundaries. The llms.txt standard is simple (markdown file with H1 + blockquote + optional sections), with extended llms-full.txt providing comprehensive content. Core Web Vitals verification uses Next.js built-in `useReportWebVitals` hook with targets of LCP <2.5s, INP <200ms, CLS <0.1. Production readiness requires internationalized not-found.tsx, error.tsx boundaries, and loading.tsx states compatible with next-intl.

**Primary recommendation:** Use PostHog provider pattern + Suspense-wrapped pageview tracking, generate static llms.txt files (not dynamic routes), verify CWV with useReportWebVitals, implement i18n-compatible error/loading states per next-intl conventions.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| posthog-js | Latest | Analytics tracking and feature flags | Official PostHog SDK, React hooks included, 100k+ weekly downloads |
| next/web-vitals | Built-in | Core Web Vitals measurement | Native Next.js integration, automatic metrics collection |
| next-intl | Already installed | Error page internationalization | Already used in Phases 1-4 for bilingual routing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @posthog/nextjs | Latest | Alternative wrapper package | Optional, provides tighter Next.js integration but less flexible |
| React Suspense | Built-in | Boundary for useSearchParams | Required when using navigation hooks in Client Components |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PostHog | Google Analytics 4 | GA4 more widely known but less feature-rich (no session replay, feature flags) |
| PostHog | Plausible/Umami | Privacy-focused but lacks advanced features (funnels, cohorts, A/B testing) |
| llms.txt | robots.txt only | llms.txt provides structured content for AI systems, robots.txt only controls crawling |
| useReportWebVitals | Vercel Analytics | Vercel Analytics is managed service (costs money), useReportWebVitals is free |

**Installation:**
```bash
bun add posthog-js
```

No additional packages needed (Next.js web vitals built-in, next-intl already installed).

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── analytics/
│   │   ├── posthog-provider.tsx    # Client Component provider
│   │   └── posthog-pageview.tsx    # Pageview tracking component
│   └── metadata/
│       └── seo-config.ts           # (exists) Source data for llms.txt
├── app/
│   ├── layout.tsx                  # Wrap with PostHogProvider + WebVitals
│   ├── [locale]/
│   │   ├── layout.tsx              # NextIntlClientProvider (exists)
│   │   ├── not-found.tsx           # Internationalized 404
│   │   ├── error.tsx               # Internationalized error boundary
│   │   └── loading.tsx             # Loading state
│   └── [...rest]/
│       └── page.tsx                # Catch-all route triggering notFound()
public/
├── llms.txt                        # Static file (required)
└── llms-full.txt                   # Static file (optional extended)
```

### Pattern 1: PostHog Provider Initialization

**What:** Initialize PostHog SDK in Client Component provider, wrap app in root layout
**When to use:** Every Next.js App Router PostHog integration
**Example:**
```typescript
// Source: https://reetesh.in/blog/posthog-integration-in-next.js-app-router
// src/lib/analytics/posthog-provider.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (typeof window !== "undefined") {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		person_profiles: "identified_only",
		capture_pageview: false, // Manual pageview tracking
		capture_pageleave: true,
	});
}

export function PHProvider({ children }: { children: React.ReactNode }) {
	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

**Critical details:**
- MUST use `"use client"` directive (Client Component)
- Initialize outside component to avoid re-initialization on re-renders
- Set `capture_pageview: false` (manual tracking required for App Router)
- `person_profiles: "identified_only"` reduces unnecessary profile creation
- Check `typeof window !== "undefined"` for SSR safety

### Pattern 2: Manual Pageview Tracking with Suspense

**What:** Track pageviews manually using `usePathname` and `useSearchParams` wrapped in Suspense
**When to use:** Required when `capture_pageview: false` (App Router best practice)
**Example:**
```typescript
// Source: https://reetesh.in/blog/posthog-integration-in-next.js-app-router
// src/lib/analytics/posthog-pageview.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	useEffect(() => {
		if (pathname && posthog) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url = url + `?${searchParams.toString()}`;
			}
			posthog.capture("$pageview", {
				$current_url: url,
			});
		}
	}, [pathname, searchParams, posthog]);

	return null;
}
```

**In layout (MUST wrap in Suspense):**
```typescript
// Source: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
import { Suspense } from "react";
import { PostHogPageView } from "@/lib/analytics/posthog-pageview";

<Suspense fallback={null}>
	<PostHogPageView />
</Suspense>
```

**Critical details:**
- MUST wrap in `<Suspense>` boundary (Next.js requirement for `useSearchParams`)
- Returns `null` (no UI rendered)
- Tracks on pathname/searchParams change
- Use `window.origin` to construct full URL

### Pattern 3: Core Web Vitals Reporting

**What:** Use Next.js built-in `useReportWebVitals` hook to measure and report CWV
**When to use:** Every production app for performance monitoring
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/analytics
// src/lib/analytics/web-vitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
	useReportWebVitals((metric) => {
		// Send to analytics endpoint
		const body = JSON.stringify(metric);
		const url = "/api/analytics"; // or PostHog

		if (navigator.sendBeacon) {
			navigator.sendBeacon(url, body);
		} else {
			fetch(url, { body, method: "POST", keepalive: true });
		}
	});

	return null;
}
```

**Metrics available:**
- TTFB (Time to First Byte)
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint) - **target: <2.5s**
- FID (First Input Delay) - deprecated, use INP
- INP (Interaction to Next Paint) - **target: <200ms**
- CLS (Cumulative Layout Shift) - **target: <0.1**

**Critical details:**
- Use `navigator.sendBeacon()` when available (doesn't block page unload)
- Fallback to `fetch()` with `keepalive: true`
- Component returns `null`, imported in root layout
- Can send to PostHog via `posthog.capture("web_vitals", metric)`

### Pattern 4: Internationalized Error Pages (next-intl)

**What:** Create localized not-found.tsx and error.tsx with `useTranslations` hook
**When to use:** Any next-intl app requiring i18n error handling
**Example:**
```typescript
// Source: https://next-intl.dev/docs/environments/error-files
// src/app/[locale]/not-found.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
	const t = useTranslations("NotFound");
	return (
		<div>
			<h1>{t("title")}</h1>
			<p>{t("description")}</p>
			<Link href="/">{t("backHome")}</Link>
		</div>
	);
}
```

**Catch-all route to trigger notFound():**
```typescript
// Source: https://next-intl.dev/docs/environments/error-files
// src/app/[locale]/[...rest]/page.tsx
import { notFound } from "next/navigation";

export default function CatchAllPage() {
	notFound();
}
```

**Critical details:**
- Place in `app/[locale]/not-found.tsx` (inside locale folder)
- `useTranslations` hook works because NextIntlClientProvider wraps layout
- MUST create catch-all route to trigger for unknown paths
- Root `app/not-found.tsx` handles requests outside locale paths

### Pattern 5: llms.txt Static File Format

**What:** Markdown file at `/llms.txt` describing site for AI systems
**When to use:** Required for AI discoverability (GEO-02)
**Example:**
```markdown
# 404 Tech Found

> 404 Tech Found is a Latin American tech hub building AI, biotech, and hardware innovation. We connect founders, collaborators, and investors to accelerate emerging tech.

## Programs
- Founder-in-Residence: Supports technical founders building AI/biotech/hardware startups
- Tech Events: Regular meetups, hackathons, and demo days in Buenos Aires

## Houses
Three specialized tracks:
- House of AI: Machine learning, LLMs, computer vision
- House of Biotech: Synthetic biology, drug discovery, diagnostics
- House of Hardware: IoT, robotics, embedded systems

## Contact
- Website: https://404techfound.org
- Location: Buenos Aires, Argentina
```

**Extended llms-full.txt format:**
- Include complete program details (curriculum, timelines, requirements)
- Full event calendar with dates and descriptions
- Detailed house focus areas with example projects
- Team bios and backgrounds
- Partners and supporters list

**Critical details:**
- MUST have H1 heading (required)
- SHOULD have blockquote summary (recommended)
- Use H2 sections for topics
- Keep llms.txt concise (< 2KB), llms-full.txt comprehensive (< 100KB)
- Place in `public/` directory as static files (NOT dynamic routes)

### Anti-Patterns to Avoid

- **Provider in Client Component tree:** Don't initialize PostHog inside a nested Client Component - put provider in root layout to wrap entire app
- **useSearchParams without Suspense:** Will cause "Missing Suspense boundary" build error in production
- **Automatic pageview capture:** Don't use `capture_pageview: true` with App Router (misses client-side navigations)
- **Dynamic llms.txt route:** Don't create `app/llms.txt/route.ts` - use static `public/llms.txt` file (simpler, faster)
- **Hardcoded analytics URLs:** Don't hardcode PostHog URLs in components - use env vars
- **Ignoring CWV thresholds:** Don't assume "good enough" - Google's thresholds are strict (LCP 2.5s not 3s)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Analytics SDK | Custom fetch-based tracking | posthog-js with React hooks | Session management, deduplication, offline queuing, feature flags built-in |
| Web Vitals measurement | Manual Performance API calls | useReportWebVitals hook | Next.js handles metric collection, normalization, and custom events automatically |
| Error boundaries | Try-catch in every component | error.tsx + global-error.tsx | Next.js convention handles routing-level errors, automatic recovery UI |
| Loading states | Manual Suspense boundaries everywhere | loading.tsx convention | Next.js automatically wraps route segments, cleaner code |
| 404 detection | Custom middleware checking routes | not-found.tsx + catch-all route | Next.js convention, automatic 404 status codes, SEO-friendly |

**Key insight:** Next.js App Router provides file-based conventions (error.tsx, loading.tsx, not-found.tsx) that handle complex edge cases (streaming, hydration, status codes) better than manual implementations. PostHog SDK handles analytics complexity (batching, retries, session tracking) that's error-prone to build custom.

## Common Pitfalls

### Pitfall 1: PostHog initialized on every render

**What goes wrong:** Calling `posthog.init()` inside component body causes re-initialization on every render, losing session state
**Why it happens:** Developers unfamiliar with React hooks put initialization in component function
**How to avoid:** Initialize PostHog outside component (module-level), check `typeof window !== "undefined"`
**Warning signs:** Console errors "PostHog already initialized", multiple sessions for same user

### Pitfall 2: Missing Suspense boundary for useSearchParams

**What goes wrong:** Build fails with "useSearchParams() should be wrapped in a suspense boundary" error
**Why it happens:** Next.js requires Suspense for dynamic hooks during static rendering to prevent full-page client-side rendering bailout
**How to avoid:** Always wrap components using `useSearchParams` in `<Suspense fallback={null}>`
**Warning signs:** Build error in production, no error in dev mode

### Pitfall 3: llms.txt too large or unstructured

**What goes wrong:** AI systems truncate content or fail to parse key information
**Why it happens:** Developers dump entire documentation without structure
**How to avoid:** Keep llms.txt < 2KB with clear H1/H2 structure, use llms-full.txt for details
**Warning signs:** AI assistants give incorrect information about your project

### Pitfall 4: CWV measured only on fast networks

**What goes wrong:** Production users experience poor performance not reflected in Lighthouse scores
**Why it happens:** Testing on local dev or fast WiFi doesn't represent real user conditions
**How to avoid:** Test with Lighthouse throttling (Slow 4G + 4x CPU slowdown), check field data in Search Console
**Warning signs:** Lighthouse 95+ but high bounce rate, complaints about slow loading

### Pitfall 5: Error boundary catches layout errors

**What goes wrong:** Errors in `layout.tsx` aren't caught by `error.tsx` in same segment
**Why it happens:** React error boundaries can't catch errors in same component tree level
**How to avoid:** Place `error.tsx` in parent segment or use `global-error.tsx` for root layout errors
**Warning signs:** Unhandled errors crash entire app instead of showing error UI

### Pitfall 6: Ad blockers blocking PostHog requests

**What goes wrong:** Analytics don't track ~40% of users due to browser extensions
**Why it happens:** Ad blockers detect "posthog" or "analytics" in URLs
**How to avoid:** Use Next.js rewrites to proxy PostHog through your domain (e.g., `/ingest` → PostHog API)
**Warning signs:** Significantly lower user counts than server-side logs show

**Reverse proxy pattern (optional for Phase 5):**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
		];
	},
};
```

**Update PostHog init:**
```typescript
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
	api_host: "/ingest", // Use local proxy
	ui_host: "https://us.posthog.com",
});
```

**Note:** Vercel rewrites have known issues with PostHog (GitHub #17596). Test thoroughly or defer to post-Phase 5.

## Code Examples

Verified patterns from official sources:

### PostHog Integration (Complete)

```typescript
// src/lib/analytics/posthog-provider.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		person_profiles: "identified_only",
		capture_pageview: false,
		capture_pageleave: true,
	});
}

export function PHProvider({ children }: { children: React.ReactNode }) {
	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

```typescript
// src/lib/analytics/posthog-pageview.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	useEffect(() => {
		if (pathname && posthog) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url = url + `?${searchParams.toString()}`;
			}
			posthog.capture("$pageview", {
				$current_url: url,
			});
		}
	}, [pathname, searchParams, posthog]);

	return null;
}
```

```typescript
// src/app/layout.tsx (update)
import { Suspense } from "react";
import { PHProvider } from "@/lib/analytics/posthog-provider";
import { PostHogPageView } from "@/lib/analytics/posthog-pageview";

export default async function RootLayout({ children }: Props) {
	return (
		<html lang={locale}>
			<body>
				<PHProvider>
					<Suspense fallback={null}>
						<PostHogPageView />
					</Suspense>
					{children}
				</PHProvider>
			</body>
		</html>
	);
}
```

### Web Vitals Tracking

```typescript
// src/lib/analytics/web-vitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePostHog } from "posthog-js/react";

export function WebVitals() {
	const posthog = usePostHog();

	useReportWebVitals((metric) => {
		// Send to PostHog
		posthog.capture("web_vitals", {
			metric_name: metric.name,
			metric_value: metric.value,
			metric_id: metric.id,
			metric_rating: metric.rating,
		});
	});

	return null;
}
```

### Internationalized Not Found Page

```typescript
// src/app/[locale]/not-found.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
	const t = useTranslations("NotFound");

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="text-4xl font-bold">{t("title")}</h1>
			<p className="mt-4 text-muted-foreground">{t("description")}</p>
			<Link
				href="/"
				className="mt-8 rounded-md bg-primary px-4 py-2 text-primary-foreground"
			>
				{t("backHome")}
			</Link>
		</div>
	);
}
```

```typescript
// src/app/[locale]/[...rest]/page.tsx (catch-all)
import { notFound } from "next/navigation";

export default function CatchAllPage() {
	notFound();
}
```

### Internationalized Error Boundary

```typescript
// src/app/[locale]/error.tsx
"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("Error");

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h2 className="text-2xl font-bold">{t("title")}</h2>
			<p className="mt-4 text-muted-foreground">{t("description")}</p>
			<button
				onClick={reset}
				className="mt-8 rounded-md bg-primary px-4 py-2 text-primary-foreground"
			>
				{t("retry")}
			</button>
		</div>
	);
}
```

### Loading State

```typescript
// src/app/[locale]/loading.tsx
export default function Loading() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary" />
		</div>
	);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GA4 pageview autocapture | Manual pageview tracking with usePathname | Next.js 13 (App Router) | Required for accurate SPA navigation tracking |
| Pages Router `_app.tsx` providers | Root layout.tsx providers | Next.js 13 (2023) | Server Components default, providers must be Client Components |
| reportWebVitals export in _app | useReportWebVitals hook | Next.js 13.4 (2023) | Simpler API, works with streaming |
| FID metric | INP metric | March 2024 | Better interactivity measurement (all interactions, not just first) |
| robots.txt only | robots.txt + llms.txt | September 2024 | AI systems need structured content beyond crawl directives |
| global-error.jsx optional | global-error.jsx experimental flag | Next.js 15.4 (2024) | Better error handling for multiple root layouts |
| error.tsx catches layout errors | error.tsx can't catch same-segment layout | Always true | React limitation, must place error.tsx in parent |

**Deprecated/outdated:**
- FID (First Input Delay): Replaced by INP in Core Web Vitals (March 2024)
- Pages Router analytics patterns: Use App Router conventions (useReportWebVitals, layout providers)
- `<script>` tag PostHog init: Use React provider pattern for better integration

## Open Questions

Things that couldn't be fully resolved:

1. **PostHog reverse proxy on Vercel**
   - What we know: GitHub issue #17596 reports Vercel rewrites don't work with PostHog in production
   - What's unclear: Whether this is still broken in 2026, or if workarounds exist
   - Recommendation: Implement direct PostHog integration first (Phase 5), defer reverse proxy to post-launch optimization if ad blocking becomes measurable issue

2. **llms-full.txt optimal size**
   - What we know: LangGraph's llms-full.txt is "several hundred thousand tokens" exceeding most LLM context windows
   - What's unclear: What's the practical upper limit for usability
   - Recommendation: Start with <100KB (roughly 25k tokens), expand if AI systems request more detail

3. **Core Web Vitals field data collection timing**
   - What we know: Need real user data for accurate CWV measurement
   - What's unclear: How long to wait before field data is statistically significant
   - Recommendation: Use Lighthouse lab data (simulated) for Phase 5 verification, plan 2-4 weeks of field data collection post-launch

4. **Next.js 16 instrumentation-client.js vs provider pattern**
   - What we know: instrumentation-client.js runs before hydration, provider pattern runs during React initialization
   - What's unclear: Whether PostHog should move to instrumentation-client.js for earlier tracking
   - Recommendation: Use provider pattern (established, working, less likely to break). Instrumentation-client.js added in Next.js 15.3 (December 2024), still relatively new

## Sources

### Primary (HIGH confidence)

- [Next.js Analytics Guide](https://nextjs.org/docs/app/guides/analytics) - Official Next.js documentation for useReportWebVitals
- [Next.js error.js Reference](https://nextjs.org/docs/app/api-reference/file-conventions/error) - Error boundary conventions
- [Next.js loading.js Reference](https://nextjs.org/docs/app/api-reference/file-conventions/loading) - Loading state conventions
- [Next.js not-found.js Reference](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) - 404 page conventions
- [Next.js instrumentation-client.js Reference](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client) - Client instrumentation
- [next-intl Error Files Guide](https://next-intl.dev/docs/environments/error-files) - Internationalized error handling
- [llms.txt Standard](https://llmstxt.org/) - Official llms.txt specification

### Secondary (MEDIUM confidence)

- [PostHog Next.js Integration Guide](https://reetesh.in/blog/posthog-integration-in-next.js-app-router) - Community guide (verified pattern)
- [Vercel PostHog Knowledge Base](https://vercel.com/kb/guide/posthog-nextjs-vercel-feature-flags-analytics) - Vercel official guide
- [Next.js Core Web Vitals Patterns](https://www.patterns.dev/react/nextjs-vitals/) - Web.dev verified patterns
- [Next.js Suspense Boundary Error](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout) - Official error documentation
- [Lighthouse 100 Checklist](https://medium.com/better-dev-nextjs-react/lighthouse-100-with-next-js-the-missing-performance-checklist-e87ee487775f) - Community best practices (December 2025)
- [Next.js Image Optimization](https://strapi.io/blog/nextjs-image-optimization-developers-guide) - Community guide (verified)

### Tertiary (LOW confidence - marked for validation)

- PostHog reverse proxy patterns on Vercel - Known issues, needs verification
- llms-full.txt optimal size recommendations - No official guidance, community consensus

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official PostHog SDK + Next.js built-in features, well-documented
- Architecture: HIGH - Official Next.js conventions (error.tsx, loading.tsx, not-found.tsx) + next-intl documented patterns
- Pitfalls: HIGH - Verified from official Next.js error messages + GitHub issues with reproducing cases

**Research date:** 2026-02-12
**Valid until:** March 15, 2026 (30 days - stable ecosystem, Next.js 16 stable since October 2024)

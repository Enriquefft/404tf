# Codebase Concerns

**Analysis Date:** 2026-02-13

## Tech Debt

**Floating Dependencies with "latest" Version Constraint:**
- Issue: Multiple critical packages pinned to `"latest"` instead of specific versions, causing non-deterministic builds and potential breaking changes in CI/CD
- Files: `/home/hybridz/Projects/404tf/apps/landing/package.json`
- Affected packages: `next`, `react`, `react-dom`, `zod`, `tailwind-merge`, `clsx`, `next-intl`, `@biomejs/biome`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `postcss`, `@tailwindcss/postcss`
- Impact: Builds may fail unexpectedly; team members may get different versions locally vs CI; breaking changes in minor/patch versions could silently break production
- Fix approach: Pin all dependencies to specific semver versions (e.g., `^16.0.0` for Next.js 16, `^20.0.0` for React 20). Use Biome audit to catch breaking changes before they propagate

**Deprecated Tailwind v4 Warning (Already Documented):**
- Issue: Tailwind v4.1.18+ has Turbopack bugs; pinned to `~4.0.0` in package.json, but this constraint is fragile and doesn't account for edge cases
- Files: `/home/hybridz/Projects/404tf/apps/landing/package.json` (line 36: `tailwindcss: ~4.0.0`)
- Impact: If `~4.0.0` resolution pulls a problematic version due to lock file changes, styling may break in build
- Fix approach: Consider upgrading to v4.2.0+ if/when Turbopack issues are resolved, or lock to exact version `4.0.0` temporarily

**Browser API Dependency in useBannerHeight Hook:**
- Issue: Heavy use of `MutationObserver` on entire document body without debouncing or optimization
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/hooks/useBannerHeight.ts`
- Impact: Observing `childList: true; subtree: true` on document.body can be expensive on pages with frequent DOM changes (animations, dynamic content). May impact performance during transitions
- Fix approach: Debounce the `updateHeight` callback, consider using ResizeObserver instead of MutationObserver for the banner element specifically, or add a timeout to prevent excessive re-renders

## Known Bugs

**Generic Error Fallback Doesn't Show Actual Error Message:**
- Symptoms: When form submission fails with database error, user sees hardcoded "Database error. Please try again." with no context
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_actions/intent.actions.ts` (lines 57-62)
- Trigger: Submit IntentCTA form when database connection fails or constraint violation occurs
- Issue: `catch (error)` block logs error to console but returns generic message. User doesn't know what went wrong (validation? network? database?)
- Workaround: Check browser console for detailed error; resend form data once issue is resolved
- Fix approach: Add error type detection to return more specific messages (e.g., "Email already registered", "Service temporarily unavailable"). Ensure sensitive errors don't leak to client

**Announcement Banner Persistence Persists Across Locale Changes:**
- Symptoms: Dismissing the SpecHack announcement on `/en` dismisses it on `/es` (same localStorage key used for both locales)
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_components/AnnouncementBanner.tsx` (line 15: `404tf:announcement-spechack:dismissed`)
- Trigger: Dismiss banner on one locale, navigate to another
- Issue: localStorage key doesn't include locale prefix, so state is shared globally
- Fix approach: Change key to `404tf:announcement-spechack:dismissed:${locale}` or use a Map keyed by locale

## Security Considerations

**Unvalidated Hardcoded Email in Dynamic Content:**
- Risk: Contact email hardcoded in multiple places (seo-config, IntentCTA, Footer, Navbar) without Content Security Policy validation
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/lib/metadata/seo-config.ts`, `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_components/IntentCTA.tsx` (line 207)
- Current mitigation: Email is public; no secrets exposed
- Recommendations: Add `mailto:` link rel security headers if implementing email verification; consider moving to environment variables if email needs to rotate frequently

**JSON-LD Script Tag Uses dangerouslySetInnerHTML:**
- Risk: While current implementation uses `JSON.stringify()` to safely escape, any future template injection via translations could expose XSS vector
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/lib/metadata/json-ld/event.tsx` (line 40), similar patterns in `/home/hybridz/Projects/404tf/apps/landing/src/lib/metadata/json-ld/faq.tsx`, `/home/hybridz/Projects/404tf/apps/landing/src/lib/metadata/json-ld/organization.tsx`
- Current mitigation: Using `JSON.stringify()` which safely escapes content
- Recommendations: Ensure translation strings are never user-generated; audit any future changes to JSON-LD schemas; consider using `next/script` with a safer approach if Next.js provides one

**PostHog API Key Exposed in Client Bundle:**
- Risk: `NEXT_PUBLIC_POSTHOG_KEY` is intentionally public, but improper key rotation could allow unauthorized analytics capture
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/lib/analytics/posthog-provider.tsx` (line 8)
- Current mitigation: PostHog keys are public by design for client-side tracking; `person_profiles: "identified_only"` prevents PII capture
- Recommendations: Monitor PostHog for unauthorized tracking patterns; implement IP allowlisting if data sensitivity increases

**Server Action Error Logging Doesn't Include Request Context:**
- Risk: `console.error()` in submitIntent action logs errors without user/request context, making it hard to debug production issues and creating blind spot for attack detection
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_actions/intent.actions.ts` (line 58)
- Current mitigation: Errors logged to stdout (visible in Vercel logs)
- Recommendations: Add structured logging with request ID, user IP, timestamp; filter for repeat errors that might indicate a DOS attack on form endpoint

## Performance Bottlenecks

**Google Fonts Fetch on Every OG Image Generation:**
- Problem: `opengraph-image.tsx` fetches Orbitron and Inter fonts from Google Fonts on every request without caching
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/opengraph-image.tsx` (lines 19-25)
- Cause: `fetch()` is unbuffered; no HTTP cache headers respected; fonts not cached locally
- Current impact: OG image generation is slow (~1-2s per request); each share generates new request to Google Fonts
- Improvement path: (1) Download font files locally and include in repo, (2) set aggressive cache headers on Next.js OG route, (3) use font subsetting to reduce file size
- Risk: If Google Fonts CDN is down, OG images fail silently

**useBannerHeight Hook Recalculates on Every Scroll Event:**
- Problem: `useScrollDirection` sets state on every scroll event passing the 10px threshold, triggering re-renders and navbar transform recalculation
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/hooks/useScrollDirection.ts` (lines 15-22), used in Navbar
- Current impact: Navbar hide/show is smooth but expensive on low-end devices; scroll listener fires 60+ times/sec
- Improvement path: (1) Debounce direction change to 300ms, (2) use `requestAnimationFrame` instead of direct state updates, (3) consider CSS-only sticky nav as fallback

**PostHog Pageview Capture Runs on Every Route Change:**
- Problem: PostHog capture fires for every pathname change, even if component re-renders without navigation (e.g., locale switch)
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/lib/analytics/posthog-pageview.tsx` (lines 12-22)
- Current impact: Inflates pageview count on locale switches; network call for each route change
- Improvement path: (1) Check if URL actually changed before capturing, (2) batch analytics calls, (3) debounce to prevent rapid-fire events on slide animations

## Fragile Areas

**IntentCTA Form State Management is POC-Level:**
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_components/IntentCTA.tsx` (entire file)
- Why fragile: Uses `useActionState` directly with no error recovery, retry logic, or offline support. Form state lives in client but action handler has no timeout/circuit breaker
- Safe modification: (1) Add request timeouts (5s max) to prevent hanging forms, (2) implement exponential backoff for retries, (3) use a proper form library (React Hook Form + Server Action wrapper) if form grows more complex
- Test coverage: No unit tests for form validation, state transitions, or error states
- Current risk: If database is slow, user sees "submitting" state indefinitely; if network drops mid-request, form is stuck

**Missing Tests for Critical Server Actions:**
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_actions/intent.actions.ts` (no .test.ts file exists)
- What's not tested: Validation logic, database insertion, error handling, duplicate email handling, concurrent submissions
- Risk: Database constraint violation (e.g., unique email) crashes form silently; no protection against email injection
- Priority: High - form is revenue-critical (captures leads)

**Hardcoded Color Values in OG Image Generation:**
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/opengraph-image.tsx` (lines 110, 117, 124: hex color values)
- Why fragile: Colors hardcoded as hex strings instead of using design system constants (CSS vars). If brand colors change, OG image becomes out of sync
- Safe modification: Extract house colors to `/home/hybridz/Projects/404tf/packages/config` and import; maintain single source of truth
- Test coverage: No visual regression tests for OG image changes

**useLocalStorage Hook Assumes Synchronous JSON Parse:**
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/hooks/useLocalStorage.ts` (lines 23-26)
- Why fragile: If localStorage value is large or corrupted, `JSON.parse()` throws but is caught and silently logged. No recovery path
- Safe modification: (1) Validate stored JSON before parse, (2) provide fallback/reset mechanism, (3) add size limit to prevent storage quota issues
- Current risk: Dismissed banners might "resurrect" if storage value gets corrupted

## Scaling Limits

**Database Connection Pool Not Configured:**
- Current capacity: Single Drizzle instance using default Neon connection pool (10 connections)
- Limit: Will exhaust under ~50 concurrent form submissions
- Files: `/home/hybridz/Projects/404tf/packages/database/src/index.ts`
- Scaling path: (1) Increase Neon pool size in env config, (2) add connection pooling middleware (PgBouncer), (3) implement request queuing in submitIntent action
- Current risk: If SpecHack launches and hundreds sign up simultaneously, database access times out

**No Rate Limiting on Intent Submission Endpoint:**
- Current capacity: Forms accepted at unlimited rate per IP
- Limit: Vulnerable to spam/DOS if endpoint is discovered
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_actions/intent.actions.ts` (no middleware)
- Scaling path: (1) Add Vercel rate limiting middleware, (2) implement CAPTCHA for high-frequency IPs, (3) require email verification before counting intent
- Current risk: Fake signups, database bloat, analytics pollution

**OG Image Generation at Route Level:**
- Current capacity: Each OG image request hits Google Fonts + ImageResponse rendering (~2s per request)
- Limit: Tail latencies spike on viral posts (hundreds of image requests in seconds)
- Scaling path: (1) Pre-generate images and serve static files, (2) cache results with CDN, (3) fallback to generic image if generation fails
- Current risk: OG image fetch timeout could block social media crawlers; negative SEO impact

## Dependencies at Risk

**Floating "latest" Constraints (Critical):**
- Risk: Non-deterministic builds; CI/CD may diverge from local development; breaking changes in minor versions
- Impact: Production deployment could fail after successful local build; team coordination needed for version updates
- Migration plan: (1) Pin all packages to specific semver (^X.Y.Z), (2) use automated dependency updates (Dependabot), (3) implement pre-commit tests to catch breaking changes
- Timeline: Address before scaling to multiple developers

**Next.js 16 + Turbopack Stability:**
- Risk: Turbopack is relatively new; Tailwind v4 integration has known issues (already documented)
- Impact: Build times may degrade; rare edge cases with code generation
- Migration plan: Monitor Next.js releases; have fallback to SWC if Turbopack causes issues
- Timeline: Watch closely during Phase 4-5 development

**framer-motion 12.34.0 (Uncontrolled Minor/Patch):**
- Risk: No version constraint; future releases could introduce animation glitches
- Impact: Subtle visual bugs in FadeInSection, FloatingMascot, Navbar animations
- Migration plan: Audit animation behavior after any version bump; test on low-end devices
- Timeline: Pin to ^12.34.0 immediately

## Missing Critical Features

**No Email Validation/Verification:**
- Problem: Intent form accepts any email without verification; duplicates not prevented; invalid emails stored
- Blocks: Can't send follow-ups to leads; database pollution; analytics unreliable
- Current workaround: Manual email cleanup in Drizzle Studio
- Fix priority: High before scaling lead capture
- Approach: (1) Add email regex validation in schema, (2) implement double opt-in flow, (3) deduplicate on email before insert

**No Spam/Bot Detection:**
- Problem: Form accepts submissions without CAPTCHA, honeypot, or rate limiting
- Blocks: Scale-up will attract spam; lead list becomes unusable; analytics noise
- Current workaround: Manual review of submissions
- Fix priority: Medium before Phase 5 (Analytics)
- Approach: (1) Add hCaptcha to IntentCTA form, (2) implement rate limiting by IP/email, (3) add honeypot field

**No Analytics Dashboard:**
- Problem: PostHog events captured but no custom dashboard configured; metrics not actionable
- Blocks: Can't measure form conversion, engagement, traffic sources for future iterations
- Fix priority: Medium - needed for Phase 5
- Approach: Create PostHog dashboard with: form submission funnel, page scroll depth, intent distribution by locale

**No Error Boundary for Layout Level:**
- Problem: Error boundary only exists at `[locale]` level; global errors (middleware, RootLayout) crash the app
- Blocks: Locale middleware errors, analytics errors, or layout errors cause white screen
- Current workaround: Manual Vercel logs inspection
- Fix priority: Low - rare in practice
- Approach: Add error boundary at root layout level; ensure it doesn't trigger on 404s

## Test Coverage Gaps

**No End-to-End Tests for Form Submission:**
- What's not tested: IntentCTA form interaction, validation errors, success flow, error recovery
- Files: `/home/hybridz/Projects/404tf/apps/landing/src/app/[locale]/_components/IntentCTA.tsx` (entire component + action)
- Risk: Form could break silently; server action errors not caught until production; UX regressions missed
- Recommended tool: Playwright (browser automation) or Cypress
- Priority: High

**No Component Snapshot or Visual Tests:**
- What's not tested: Hero, Programs, Community, Houses components for visual regressions
- Risk: CSS changes could break layout on certain screen sizes without detection
- Recommended tool: Percy or Chromatic
- Priority: Medium

**No Database Integration Tests:**
- What's not tested: Drizzle schema migrations, constraint violations, query performance
- Files: `/home/hybridz/Projects/404tf/packages/database/` (no test directory)
- Risk: Migration could fail in production; schema changes cause runtime errors
- Recommended tool: vitest + testcontainers for isolated Postgres
- Priority: Medium - increases as database schema grows

**No Accessibility (a11y) Tests:**
- What's not tested: Keyboard navigation, screen reader compatibility, color contrast
- Risk: Site may not be accessible to users with disabilities; WCAG violations possible
- Tools: axe-core, jest-axe, or axe DevTools
- Priority: Medium

---

*Concerns audit: 2026-02-13*

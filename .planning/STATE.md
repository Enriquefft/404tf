# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Landing page that communicates what 404 Tech Found is and converts visitors into leads (founders, collaborators, connectors) -- across human search engines and AI systems.
**Current focus:** Phase 5 -- Analytics & GEO

## Current Position

Phase: 5 of 5 (Analytics & GEO)
Plan: 2 of 2 in current phase
Status: Phase complete
Last activity: 2026-02-13 -- Completed 05-02-PLAN.md (llms.txt + production states)

Progress: [██████████] 100% (12/12 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 3.5 minutes
- Total execution time: 0.74 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-Foundation | 3/3 | 12.1m | 4.0m |
| 2-Static Content | 3/3 | 11.1m | 3.7m |
| 3-Interactive | 3/3 | 9.9m | 3.3m |
| 4-SEO & Metadata | 2/2 | 7.2m | 3.6m |
| 5-Analytics & GEO | 2/2 | 6.3m | 3.2m |

**Recent Trend:**
- Last 5 plans: 04-01 (4.3m), 04-02 (2.9m), 05-01 (2.7m), 05-02 (3.6m)
- Trend: Consistent velocity (3.5m average for last 5, matches overall average)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| ID | Phase | Decision | Impact |
|----|-------|----------|--------|
| use-bun-runtime | 01-01 | Use Bun as package manager and test runner | All plans use `bun` commands |
| use-biome-over-eslint | 01-01 | Use Biome instead of ESLint + Prettier | All code uses tabs + double quotes, ~100x faster linting |
| system-level-git-tools | 01-01 | Use Lefthook + commitlint-rs from Nix devShell | CI and devShell have identical git hooks |
| pin-tailwind-v4.0.x | 01-01 | Pin tailwindcss to ~4.0.0 (v4.0.17) | Avoid v4.1.18 Turbopack bug in Plan 01-02 |
| tailwind-v4-import | 01-02 | Use Tailwind v4 @import syntax | Modern CSS approach, required for v4 |
| css-variable-theming | 01-02 | Store theme as CSS variables in :root | shadcn/ui compatibility, enables theme switching |
| house-color-system | 01-02 | Define house colors as first-class CSS variables | AI pink, Biotech green, Hardware orange throughout site |
| nextjs16-proxy-naming | 01-02 | Use src/app/proxy.ts for middleware | Next.js 16 App Router convention |
| font-css-variables | 01-02 | Load fonts via next/font/google with CSS vars | Optimal performance, automatic optimization |
| use-t3-env | 01-03 | Use @t3-oss/env-nextjs for runtime env validation | Type-safe env with Zod schemas, helpful startup errors |
| module-level-db-singleton | 01-03 | Export db directly as module-level singleton | Optimal performance in serverless (Drizzle best practice) |
| landing-prefix-enums | 01-03 | Prefix enums with landing_ to avoid collisions | Database has many existing enums from other tables |
| intent-key-restructure | 02-01 | Flatten intent.* keys to avoid JSON conflicts | buildSubmit, collaborateSubmit, connectSubmit instead of nested objects |
| component-stub-pattern | 02-01 | Create component stubs for TypeScript safety | Unblocks type checks during incremental implementation |
| disable-useUniqueElementIds | 02-02 | Disable Biome's useUniqueElementIds rule | False positive for navigation anchor IDs in Server Components |
| content-as-react-keys | 02-02 | Use benefit text/event names as React keys | More stable than array indices, better React reconciliation |
| static-placeholder-pattern | 02-03 | Static placeholders defer interactive behavior to Phase 3 | Clear separation between rendering (Phase 2) and interactivity (Phase 3) |
| social-links-as-spans | 02-03 | Render social links as spans instead of invalid anchor hrefs | Avoid Biome useValidAnchor warnings for placeholder links |
| use-hamburger-react | 03-01 | Use hamburger-react Squash component for mobile menu | Lightweight (1.5KB), pre-built animations, accessibility built-in |
| localstorage-404tf-namespace | 03-01 | Prefix localStorage keys with "404tf:" | Avoid key collisions across features |
| ssr-safe-localstorage-pattern | 03-01 | Initialize with default value, read in useEffect after hydration | Prevents hydration mismatches |
| scroll-direction-threshold | 03-01 | Use 10px threshold in useScrollDirection hook | Prevents jitter from small scroll movements |
| scroll-spy-countup | 03-02 | Use react-countup enableScrollSpy instead of intersection observer | Built-in scroll detection simplifies code |
| viewport-margin-trigger | 03-02 | Use margin: "-80px" on FadeInSection viewport | Triggers animation before element fully visible for smoother UX |
| animation-budget-tracking | 03-02 | Track total animated elements (14/15 budget after 03-03) | Prevents animation overload degrading performance |
| hero-server-component-pattern | 03-02 | Keep Hero as Server Component with Client Component child | Server Components can render Client Components as children |
| useactionstate-pattern | 03-03 | Use useActionState for Server Action form state management | React 19 + Next.js 16 best practice, simpler than TanStack Forms |
| intent-dynamic-ui | 03-03 | Dynamic submit text and helper based on selected intent | Better UX than generic "Submit" button |
| animatepresence-form-reveal | 03-03 | AnimatePresence for form field reveal on intent selection | Smooth transition enhances perceived polish |
| central-seo-config | 04-01 | Single seo-config.ts module for all SEO constants | Single source of truth for SITE_URL, SITE_NAME, SOCIAL_LINKS |
| self-referencing-canonical | 04-01 | Each locale's canonical points to itself (ES→/es, EN→/en) | Standard SEO practice for multilingual sites, hreflang links alternates |
| json-ld-in-page | 04-01 | Render JSON-LD schemas at top of page component (not layout) | Schemas describe page-specific content, ensures markup matches visible content |
| root-level-discovery-files | 04-02 | Place sitemap.ts and robots.ts at src/app root (not inside [locale]) | Discovery files are site-wide, Next.js convention is root-level placement |
| google-fonts-fetch-in-og | 04-02 | Fetch Google Fonts via URL at runtime in ImageResponse | next/font not available in edge runtime, must fetch as ArrayBuffer |
| satori-flexbox-requirement | 04-02 | Every div in ImageResponse has display: "flex" | Satori requires explicit flexbox layout, missing display causes failures |
| house-colors-in-og | 04-02 | Include house color bar at bottom of OpenGraph image | Visual branding consistency, shows AI/Biotech/Hardware focus at a glance |
| posthog-manual-pageview | 05-01 | Use manual pageview tracking (capture_pageview: false) | App Router requires manual tracking for accurate client-side navigation |
| posthog-module-init | 05-01 | Initialize PostHog at module level outside component | Prevents re-initialization on re-renders, maintains session state |
| posthog-graceful-degradation | 05-01 | PHProvider checks env vars and skips wrapping when missing | Allows dev mode without PostHog credentials, prevents crashes |
| web-vitals-to-posthog | 05-01 | Send Core Web Vitals to PostHog instead of separate endpoint | Consolidates analytics in single platform, simplifies infrastructure |
| llms-txt-single-source | 05-02 | Derive llms.txt content from seo-config.ts and translation files | Single source of truth ensures accuracy, no content duplication |
| error-boundary-no-shadow | 05-02 | Rename error.tsx export to ErrorBoundary instead of Error | Avoids Biome noShadowRestrictedNames warning while keeping Next.js convention |
| catchall-route-404 | 05-02 | Use [...rest] catch-all route calling notFound() for unknown paths | Triggers localized not-found.tsx in parent [locale] segment |

Earlier decisions:
- [Roadmap]: 5 phases in linear dependency chain, foundation-first to front-load risk
- [Roadmap]: Phase 1 split into 3 plans (init, styling+i18n, data layer) for manageable scope

### Pending Todos

None yet.

### Blockers/Concerns

- [Resolved]: TanStack Forms + Server Actions integration is POC-level maturity -- used useActionState pattern instead in 03-03
- [01-03]: Neon database contains tables from other projects (17+ enums detected during schema introspection) -- used landing_ prefix to avoid collisions
- [Resolved]: TypeScript error about missing src/env/client.js resolved in Plan 01-03
- [Resolved]: Lefthook pre-commit hooks now working after Plan 01-03 completion
- [Resolved]: `bun dev` now works after Plan 01-03 env setup
- [Resolved]: Tailwind v4.1.18 Turbopack bug avoided by using v4.0.17 (pinned to ~4.0.0)
- [Resolved]: next-intl + Next.js 16 proxy.ts integration verified in Plan 01-02 -- works correctly with src/app/proxy.ts
- [Resolved]: next.config.ts top-level await caused ERR_REQUIRE_ASYNC_MODULE -- moved env import to locale layout
- [Resolved]: Tailwind v4 @apply border-border failed -- rewrote globals.css with @theme declarations and direct CSS

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed 05-02-PLAN.md (llms.txt + production states) -- ALL PHASES COMPLETE
Resume file: None
Next up: Project complete -- ready for deployment

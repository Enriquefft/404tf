# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Landing page that communicates what 404 Tech Found is and converts visitors into leads (founders, collaborators, connectors) -- across human search engines and AI systems.
**Current focus:** Phase 3 -- Interactive Components

## Current Position

Phase: 3 of 5 (Interactive Components)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-09 -- Completed 03-02-PLAN.md

Progress: [███████...] 67% (8/12 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 3.6 minutes
- Total execution time: 0.49 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-Foundation | 3/3 | 12.1m | 4.0m |
| 2-Static Content | 3/3 | 11.1m | 3.7m |
| 3-Interactive | 2/3 | 6.9m | 3.5m |

**Recent Trend:**
- Last 5 plans: 02-02 (3m), 02-03 (4.1m), 03-01 (4.0m), 03-02 (2.9m)
- Trend: Improving efficiency (3.6m average for last 5, down from 3.8m)

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
| animation-budget-tracking | 03-02 | Track total animated elements (11/15 budget) | Prevents animation overload degrading performance |
| hero-server-component-pattern | 03-02 | Keep Hero as Server Component with Client Component child | Server Components can render Client Components as children |

Earlier decisions:
- [Roadmap]: 5 phases in linear dependency chain, foundation-first to front-load risk
- [Roadmap]: Phase 1 split into 3 plans (init, styling+i18n, data layer) for manageable scope

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: TanStack Forms + Server Actions integration is POC-level maturity -- may need useActionState fallback in Phase 3
- [01-03]: Neon database contains tables from other projects (17+ enums detected during schema introspection) -- used landing_ prefix to avoid collisions
- [Resolved]: TypeScript error about missing src/env/client.js resolved in Plan 01-03
- [Resolved]: Lefthook pre-commit hooks now working after Plan 01-03 completion
- [Resolved]: `bun dev` now works after Plan 01-03 env setup
- [Resolved]: Tailwind v4.1.18 Turbopack bug avoided by using v4.0.17 (pinned to ~4.0.0)
- [Resolved]: next-intl + Next.js 16 proxy.ts integration verified in Plan 01-02 -- works correctly with src/app/proxy.ts
- [Resolved]: next.config.ts top-level await caused ERR_REQUIRE_ASYNC_MODULE -- moved env import to locale layout
- [Resolved]: Tailwind v4 @apply border-border failed -- rewrote globals.css with @theme declarations and direct CSS

## Session Continuity

Last session: 2026-02-09
Stopped at: Completed 03-02-PLAN.md (TractionBar animations + scroll-triggered sections)
Resume file: None
Next up: 03-03 (IntentCTA interactive form)

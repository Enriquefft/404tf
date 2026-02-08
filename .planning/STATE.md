# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Landing page that communicates what 404 Tech Found is and converts visitors into leads (founders, collaborators, connectors) -- across human search engines and AI systems.
**Current focus:** Phase 2 -- Static Content Migration

## Current Position

Phase: 2 of 5 (Static Content Migration)
Plan: 0 of 2 in current phase
Status: Ready to plan
Last activity: 2026-02-08 -- Phase 1 complete (verified + fixed)

Progress: [███.......] 25% (3/12 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 4.3 minutes
- Total execution time: 0.22 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-Foundation | 3/3 | 12.1m | 4.0m |

**Recent Trend:**
- Last 5 plans: 01-01 (4.7m), 01-02 (2m), 01-03 (5.4m)
- Trend: Stable (~4m average)

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

Last session: 2026-02-08
Stopped at: Phase 1 complete -- all 3 plans executed, verified, 2 gaps fixed
Resume file: None
Next up: Phase 2 -- Static Content Migration (needs planning first)

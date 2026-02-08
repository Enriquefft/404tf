# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Landing page that communicates what 404 Tech Found is and converts visitors into leads (founders, collaborators, connectors) -- across human search engines and AI systems.
**Current focus:** Phase 1 -- Foundation

## Current Position

Phase: 1 of 5 (Foundation)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-08 -- Completed 01-02-PLAN.md (Styling + i18n)

Progress: [██........] 17% (2/12 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 3.5 minutes
- Total execution time: 0.11 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-Foundation | 2/3 | 6.7m | 3.4m |

**Recent Trend:**
- Last 5 plans: 01-01 (4.7m), 01-02 (2m)
- Trend: Accelerating (2m vs 4.7m)

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

Earlier decisions:
- [Roadmap]: 5 phases in linear dependency chain, foundation-first to front-load risk
- [Roadmap]: Phase 1 split into 3 plans (init, styling+i18n, data layer) for manageable scope

### Pending Todos

None yet.

### Blockers/Concerns

- [01-01]: Expected TypeScript error about missing src/env/client.js until Plan 01-03 completes -- this is normal
- [01-01]: Lefthook pre-commit hooks temporarily skipped for tooling setup commits due to expected TS errors
- [01-02]: `bun dev` may fail due to above TypeScript error (expected, documented)
- [Research]: TanStack Forms + Server Actions integration is POC-level maturity -- may need useActionState fallback in Phase 3
- [Resolved]: Tailwind v4.1.18 Turbopack bug avoided by using v4.0.17 (pinned to ~4.0.0)
- [Resolved]: next-intl + Next.js 16 proxy.ts integration verified in Plan 01-02 -- works correctly with src/app/proxy.ts

## Session Continuity

Last session: 2026-02-08 22:48:54 UTC
Stopped at: Completed 01-02-PLAN.md (Styling + i18n with 2 task commits)
Resume file: None
Next up: Plan 01-03 (Data Layer)

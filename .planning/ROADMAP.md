# Roadmap: 404 Tech Found Landing Page

## Overview

Migrate the existing Vite/React SPA landing page for 404 Tech Found to Next.js 16 with App Router, SSR, bilingual i18n (ES/EN), SEO/GEO optimization, and a database-backed intent form. The migration proceeds in 5 phases ordered by dependency chain: foundation and tooling first, then static server-rendered content, then interactive client islands, then SEO infrastructure, and finally analytics and AI discoverability. All 42 v1 requirements are covered across 5 phases.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffolding, i18n routing, Tailwind v4, database, and developer tooling
- [x] **Phase 2: Static Content Migration** - All landing page sections as Server Components with bilingual content
- [x] **Phase 3: Interactive Components** - Client Components for navbar, form, animations, and scroll behaviors
- [x] **Phase 4: SEO & Metadata** - Structured data, OG images, sitemap, robots.txt, and meta tags
- [x] **Phase 5: Analytics & GEO** - PostHog integration, llms.txt, Core Web Vitals, and production readiness

## Phase Details

### Phase 1: Foundation
**Goal**: A working Next.js 16 project that renders an empty locale-routed page (`/es`, `/en`) with Tailwind v4 styling, validated environment variables, database connection, and all developer tooling configured
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, FOUND-10, FOUND-11, FOUND-12
**Estimated Complexity**: High (12 requirements, highest risk -- addresses 4 of 8 documented pitfalls)
**Success Criteria** (what must be TRUE):
  1. Running `bun dev` starts the Next.js 16 dev server with Turbopack and renders a page at both `/es` and `/en` routes
  2. Tailwind v4 classes render correctly (purple gradient background, Orbitron font, house colors visible on a test element)
  3. Database connection succeeds: `intent_submissions` table exists in Neon Postgres and can be queried via Drizzle ORM
  4. Environment variables are type-safe: missing or invalid `DATABASE_URL` causes a build-time error, not a runtime crash
  5. `bun run check` (Biome) passes with zero errors on the codebase
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md -- Project initialization, all dependencies, TypeScript, Next.js config, developer tooling (Biome, Lefthook, commitlint, Knip, bunfig)
- [x] 01-02-PLAN.md -- Tailwind v4 cyberpunk theme, shadcn/ui RSC init, next-intl routing, locale layouts, test landing page
- [x] 01-03-PLAN.md -- @t3-oss/env-nextjs type-safe env vars, Drizzle ORM + Neon Postgres, intent_submissions schema, migration

### Phase 2: Static Content Migration
**Goal**: The complete landing page is visible with all 11 sections rendered as Server Components, displaying bilingual content (ES/EN) from next-intl message files, preserving the existing cyberpunk design system
**Depends on**: Phase 1 (i18n routing, Tailwind v4, shadcn/ui, layouts)
**Requirements**: STATIC-01, STATIC-02, STATIC-03, STATIC-04, STATIC-05, STATIC-06, STATIC-07, STATIC-08, STATIC-09, STATIC-10
**Estimated Complexity**: Medium (10 requirements, standard RSC pattern, highest-confidence phase)
**Success Criteria** (what must be TRUE):
  1. Visiting `/es` displays the full landing page in Spanish with all sections visible: Hero, Houses, Programs, Events, Community, Partners, Footer
  2. Visiting `/en` displays the same page in English with all text correctly translated (no Spanish leaking through)
  3. All ~140 translation keys from the existing LanguageContext are ported to next-intl message files (ES and EN)
  4. The page is mobile-responsive: all sections display correctly on 375px, 768px, and 1440px viewports
  5. Zero `'use client'` directives exist in Phase 2 section components (all are Server Components)
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md -- Install lucide-react, copy assets, complete translation files (es.json + en.json with all keys), page.tsx entry point (completed 2026-02-09)
- [x] 02-02-PLAN.md -- Primary content sections: Hero, Houses, Programs, Events as async Server Components (completed 2026-02-09)
- [x] 02-03-PLAN.md -- Secondary sections + placeholders: Community, Partners, Footer, Navbar, AnnouncementBanner, TractionBar, IntentCTA (completed 2026-02-09)

### Phase 3: Interactive Components
**Goal**: The landing page is fully interactive with a working navbar (scroll detection, mobile menu, language switcher), animated traction bar, dismissible announcement banner, Framer Motion animations across all sections, and a functional intent form that persists submissions to the database
**Depends on**: Phase 2 (static sections must exist to add interactivity to), Phase 1 (database schema for form)
**Requirements**: INTER-01, INTER-02, INTER-03, INTER-04, INTER-05, INTER-06, INTER-07
**Estimated Complexity**: High (7 requirements, but form + animations + hydration boundaries are tricky)
**Success Criteria** (what must be TRUE):
  1. Navbar shows/hides on scroll, mobile hamburger menu opens and closes, language switcher navigates between `/es` and `/en` preserving scroll position
  2. AnnouncementBanner for SpecHack is visible on first visit and stays dismissed after clicking the close button (persists via localStorage across page reloads)
  3. TractionBar numbers animate from 0 to their target values (400+, 250+, 92+, 15) when scrolled into view
  4. Intent form accepts selection of one of 3 intent cards (Build/Collaborate/Connect), validates name and email with Zod, submits via Server Action, and the submission appears in the `intent_submissions` database table
  5. Framer Motion animations work without hydration errors: hero mascot floats, sections fade in on scroll, intent cards animate on selection
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md -- Install deps, custom hooks (useScrollDirection, useLocalStorage), convert Navbar + AnnouncementBanner to Client Components (completed 2026-02-09)
- [x] 03-02-PLAN.md -- Framer Motion animation wrappers (FadeInSection, FloatingMascot), TractionBar count-up, Hero mascot float, section fade-ins (completed 2026-02-09)
- [x] 03-03-PLAN.md -- Server Action with Zod validation, IntentCTA Client Component with useActionState, card selection, form fields, database persistence (completed 2026-02-09)

### Phase 4: SEO & Metadata
**Goal**: The landing page has complete SEO infrastructure: per-locale metadata, structured data for search engines, dynamic social sharing images, and a sitemap/robots.txt that enable indexing
**Depends on**: Phase 2 (content must exist for metadata to describe), Phase 3 (intent form influences FAQ schema)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08
**Estimated Complexity**: Medium (8 requirements, well-documented Next.js APIs)
**Success Criteria** (what must be TRUE):
  1. Viewing page source at `/es` and `/en` shows distinct `<title>`, `<meta name="description">`, canonical URL, and hreflang alternate links pointing to the other locale
  2. Google Rich Results Test validates JSON-LD Organization schema (name: "404 Tech Found", social links) and Event schema (SpecHack with dates Jun 19-28 2026)
  3. Visiting `/es/opengraph-image` and `/en/opengraph-image` returns locale-specific PNG images (1200x630) with the 404 Tech Found branding
  4. `/sitemap.xml` lists all locale variants (`/es`, `/en`) and `/robots.txt` allows all crawlers and links to the sitemap
  5. Sharing the URL on social platforms (or testing via opengraph.xyz) shows correct title, description, and OG image per locale
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md -- SEO config, env vars, metadata translations, generateMetadata with per-locale titles/descriptions/canonical/hreflang/OG/Twitter, JSON-LD schemas (Organization, Event, FAQ) (completed 2026-02-13)
- [x] 04-02-PLAN.md -- Discovery files (sitemap.ts, robots.ts) and dynamic OpenGraph image generation per locale (completed 2026-02-13)

### Phase 5: Analytics & GEO
**Goal**: The landing page tracks visitor behavior via PostHog, is discoverable by AI systems via llms.txt, meets Core Web Vitals thresholds, and handles error/loading states gracefully
**Depends on**: Phase 3 (PostHog provider wraps interactive components), Phase 4 (content and metadata finalized for llms.txt)
**Requirements**: GEO-01, GEO-02, GEO-03, GEO-04, GEO-05
**Estimated Complexity**: Low (5 requirements, well-documented patterns, mostly additive)
**Success Criteria** (what must be TRUE):
  1. PostHog dashboard receives pageview events when visiting the landing page (verified in PostHog project)
  2. `/llms.txt` returns a valid llms-txt-standard document describing 404 Tech Found, and `/llms-full.txt` includes extended details about programs, events, and houses
  3. Lighthouse performance score is 90+ with LCP < 2.5s, INP < 200ms, and CLS < 0.1 on both mobile and desktop
  4. Visiting a non-existent route (e.g., `/es/nonexistent`) shows a styled 404 page, and the intent form displays appropriate error/success states after submission
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — PostHog analytics integration (provider, pageview tracking, Core Web Vitals reporting) (completed 2026-02-13)
- [x] 05-02-PLAN.md — AI discoverability (llms.txt, llms-full.txt) and production readiness (error, loading, 404 pages) (completed 2026-02-13)

## Phase Dependency Diagram

```
Phase 1: Foundation
  |
  v
Phase 2: Static Content Migration
  |
  v
Phase 3: Interactive Components
  |
  v
Phase 4: SEO & Metadata
  |
  v
Phase 5: Analytics & GEO
```

All phases are strictly sequential. Each phase builds on the artifacts of the previous one. No phases can be executed in parallel because:
- Phase 2 needs Phase 1's routing, styling, and layouts
- Phase 3 needs Phase 2's sections to add interactivity to
- Phase 4 needs Phase 3's finalized content and form for metadata/schema
- Phase 5 needs Phase 4's complete site for analytics and performance auditing

## Critical Path Analysis

The critical path runs through all 5 phases (linear dependency chain). The two highest-risk phases are:

1. **Phase 1 (Foundation)** -- Addresses 4 of 8 documented pitfalls (RSC boundaries, Tailwind v4 syntax, LanguageContext migration, Drizzle connection pooling). If this phase succeeds, remaining phases have LOW to MEDIUM risk.

2. **Phase 3 (Interactive Components)** -- Framer Motion hydration and TanStack Forms + Server Actions integration are the least-documented patterns. Research flags Phase 3 as potentially needing a fallback to `useActionState` if TanStack Forms integration proves brittle.

Phases 2, 4, and 5 use standard, well-documented patterns and carry low execution risk.

## Coverage

| Category | Requirements | Phase | Count |
|----------|-------------|-------|-------|
| Foundation (FOUND) | FOUND-01 through FOUND-12 | Phase 1 | 12 |
| Static Content (STATIC) | STATIC-01 through STATIC-10 | Phase 2 | 10 |
| Interactive (INTER) | INTER-01 through INTER-07 | Phase 3 | 7 |
| SEO & Metadata (SEO) | SEO-01 through SEO-08 | Phase 4 | 8 |
| Analytics & GEO (GEO) | GEO-01 through GEO-05 | Phase 5 | 5 |
| **Total** | | | **42** |

All 42 v1 requirements mapped. No orphans. No duplicates.

## Progress

**Execution Order:** 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-02-08 |
| 2. Static Content Migration | 3/3 | Complete | 2026-02-09 |
| 3. Interactive Components | 3/3 | Complete | 2026-02-09 |
| 4. SEO & Metadata | 2/2 | Complete | 2026-02-13 |
| 5. Analytics & GEO | 2/2 | Complete | 2026-02-13 |

---
*Created: 2026-02-08*

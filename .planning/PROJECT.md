# 404 Tech Found Landing Page

## What This Is

Production-ready Next.js 16 landing page for 404 Tech Found, a deeptech pre-incubator based in Lima, Peru. Features bilingual support (ES/EN), comprehensive SEO infrastructure, AI discoverability, database-backed lead capture, and PostHog analytics. Successfully migrated from Vite/React SPA with all animations and interactive features preserved.

## Core Value

The landing page must clearly communicate what 404 Tech Found is and convert visitors into leads (founders who want to build, orgs who want to collaborate, people who want to connect) — across both human search engines and AI systems.

## Requirements

### Validated

- ✓ Migrate all 11 existing landing sections to Next.js 16 App Router — v1.0
- ✓ Adapt existing content and copy (ES/EN) to next-intl with `[locale]` routing — v1.0 (~140 translation keys)
- ✓ Preserve existing design system: cyberpunk purple theme, Orbitron font, gradient effects, Tardi mascot, house colors — v1.0
- ✓ Implement shadcn/ui components (RSC-compatible) replacing raw Radix usage — v1.0
- ✓ Set up Drizzle ORM with Neon serverless Postgres for intent form submissions — v1.0 (module-level singleton)
- ✓ Rebuild IntentCTA form with Zod validation, saving to database — v1.0 (used useActionState instead of TanStack Forms)
- ✓ Add JSON-LD structured data (Organization, Event, FAQ schemas) — v1.0
- ✓ Add llms.txt for AI crawler discoverability — v1.0 (llms.txt + llms-full.txt)
- ✓ Implement dynamic OpenGraph images per locale — v1.0 (1200x630 PNG with house colors)
- ✓ Generate sitemap.xml and robots.txt — v1.0
- ✓ Set up proper meta tags, canonical URLs, and per-locale SEO metadata — v1.0 (with hreflang alternates)
- ✓ Integrate PostHog analytics — v1.0 (with Core Web Vitals tracking)
- ✓ Preserve Framer Motion animations (scroll-triggered, hero mascot float, count-up stats) — v1.0
- ✓ Configure Biome for linting/formatting (replacing ESLint) — v1.0 (tabs + double quotes)
- ✓ Set up @t3-oss/env-nextjs for type-safe environment variables — v1.0 (runtime validation)
- ✓ Configure Bun as runtime with bunfig.toml — v1.0
- ✓ Set up Lefthook + commitlint for git hygiene — v1.0
- ✓ Configure Knip for dead code detection — v1.0
- ✓ Tailwind v4 with custom theme (purple gradients, house colors, glow effects) — v1.0 (pinned to ~4.0.0)

### Active

(None — ready for next milestone)

### Out of Scope

- Authentication / user accounts — this is a landing page, not a web app
- Payments / Polar SDK — no transactions on the landing page
- File uploads / UploadThing — no user-generated content
- Google Maps integration — not needed for landing page
- WhatsApp Cloud API — not needed
- Blog / CMS — landing page only (can be added in a future milestone)
- Multi-page app routing beyond locale — single landing page with sections

## Context

**Shipped v1.0 (Feb 13, 2026):**
- 2,139 lines of TypeScript/TSX across 91 files
- Tech stack: Next.js 16, Bun, Tailwind v4, shadcn/ui, next-intl, Drizzle ORM, Neon Postgres, Framer Motion, PostHog
- All 42 requirements satisfied across 5 phases (13 plans)
- Milestone audit: 100% requirements coverage, 28/28 cross-phase integrations verified, 6/6 E2E flows complete

**Organization:**
- 404 Tech Found is a LATAM-focused deeptech incubator with three "houses" (AI, Biotech, Hardware)
- Programs: 12-week pre-incubation (open) and 6-month fellowship (coming soon)
- Key event: SpecHack hackathon (Jun 19-28, 2026)
- Current traction: 400+ community members, 250+ summit attendees, 92+ applicants, 15 fellows

**Audience:**
- Primary: Deeptech founders/researchers in LATAM
- Secondary: Investors, potential collaborators/partners
- Bilingual ES/EN with Spanish as default locale

**Known Issues:**
- Human verification pending (19 items): Interactive features, OG images, analytics, Core Web Vitals (see v1.0-MILESTONE-AUDIT.md)
- PostHog env vars needed for production deployment
- Database migration required in production Neon instance

## Constraints

- **Runtime:** Bun always — no npm/yarn
- **Framework:** Next.js 16 with App Router and Turbopack
- **Linting:** Biome only — no ESLint/Prettier
- **Styling:** Tailwind v4 + shadcn/ui
- **Database:** Neon serverless Postgres via Drizzle ORM
- **i18n:** next-intl with locale-based routing (ES default, EN secondary)
- **Forms:** TanStack Forms + Zod validation
- **Env:** @t3-oss/env-nextjs for type-safe env vars
- **Content source:** All text/copy comes from existing deep-tech-nexus site — adapt, don't rewrite

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 over Astro/Remix | SSR + RSC for SEO, mature ecosystem, reference template available | ✓ Good — Excellent DX, App Router patterns clean |
| Keep Framer Motion (not CSS-only) | Existing animations are rich and integral to the brand feel | ✓ Good — Animations preserved, 14/15 budget used |
| Neon serverless over other Postgres | Reference template uses it, serverless = no cold starts for landing page | ✓ Good — Module-level singleton pattern optimal |
| Strip auth/payments/uploads from template | Landing page doesn't need them, reduces complexity | ✓ Good — Reduced scope, focused on core value |
| All 4 GEO strategies (JSON-LD, llms.txt, OG, sitemap) | User wants maximum discoverability across human and AI search | ✓ Good — Full SEO infrastructure in place |
| Spanish as default locale | LATAM-focused organization, primary audience speaks Spanish | ✓ Good — ES primary, EN secondary via next-intl |
| Tailwind v4 pinned to ~4.0.0 | v4.1.18 has Turbopack bug | ✓ Good — v4.0.17 stable, bug avoided |
| useActionState over TanStack Forms | React 19 + Next.js 16 best practice | ✓ Good — Simpler, TanStack Forms POC-level maturity |
| landing_ enum prefix | Avoid collisions with existing database enums | ✓ Good — Clean namespace separation |
| Module-level db singleton | Optimal performance in serverless | ✓ Good — Drizzle best practice followed |

---
*Last updated: 2026-02-13 after v1.0 milestone completion*

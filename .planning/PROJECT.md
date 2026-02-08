# 404 Tech Found Landing Page

## What This Is

SEO and GEO-optimized landing page for 404 Tech Found, a deeptech pre-incubator based in Lima, Peru. Migrated from an existing Vite/React SPA to Next.js 16 with SSR, locale-based routing (ES/EN), structured data, and database-backed forms. The goal is to increase organic search visibility, look professional, and be discoverable by LLMs.

## Core Value

The landing page must clearly communicate what 404 Tech Found is and convert visitors into leads (founders who want to build, orgs who want to collaborate, people who want to connect) — across both human search engines and AI systems.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Migrate all 11 existing landing sections to Next.js 16 App Router (AnnouncementBanner, Navbar, Hero, TractionBar, Houses, Programs, Events, Community, Partners, IntentCTA, Footer)
- [ ] Adapt existing content and copy (ES/EN) to next-intl with `[locale]` routing (`/es`, `/en`)
- [ ] Preserve existing design system: cyberpunk purple theme, Orbitron font, gradient effects, Tardi mascot, house colors (AI/Biotech/Hardware)
- [ ] Implement shadcn/ui components (RSC-compatible) replacing raw Radix usage
- [ ] Set up Drizzle ORM with Neon serverless Postgres for intent form submissions
- [ ] Rebuild IntentCTA form with TanStack Forms + Zod validation, saving to database
- [ ] Add JSON-LD structured data (Organization, Event, FAQ schemas)
- [ ] Add llms.txt for AI crawler discoverability
- [ ] Implement dynamic OpenGraph images per locale
- [ ] Generate sitemap.xml and robots.txt
- [ ] Set up proper meta tags, canonical URLs, and per-locale SEO metadata
- [ ] Integrate PostHog analytics
- [ ] Preserve Framer Motion animations (scroll-triggered, hero mascot float, count-up stats)
- [ ] Configure Biome for linting/formatting (replacing ESLint)
- [ ] Set up @t3-oss/env-nextjs for type-safe environment variables
- [ ] Configure Bun as runtime with bunfig.toml
- [ ] Set up Lefthook + commitlint for git hygiene
- [ ] Configure Knip for dead code detection
- [ ] Tailwind v4 with custom theme (purple gradients, house colors, glow effects)

### Out of Scope

- Authentication / user accounts — this is a landing page, not a web app
- Payments / Polar SDK — no transactions on the landing page
- File uploads / UploadThing — no user-generated content
- Google Maps integration — not needed for landing page
- WhatsApp Cloud API — not needed
- Blog / CMS — landing page only (can be added in a future milestone)
- Multi-page app routing beyond locale — single landing page with sections

## Context

- **Existing site:** Complete Vite/React SPA at `deep-tech-nexus` with all UI/UX and copy finished in ES/EN. Uses React 18, Tailwind 3, shadcn, Framer Motion, custom LanguageContext for i18n, Lucide icons.
- **Reference template:** `next-fullstack-template` provides the Next.js 16 architecture patterns: `[locale]` App Router structure, next-intl config, Drizzle/Neon setup, TanStack Forms, shadcn RSC, Biome, Bun, @t3-oss/env. Template is "slightly bloated" — we strip auth, payments, uploads, maps.
- **Organization:** 404 Tech Found is a LATAM-focused deeptech incubator with three "houses" (AI, Biotech, Hardware). Programs include a 12-week pre-incubation (open) and a 6-month fellowship (coming soon). Key event: SpecHack hackathon (Jun 19-28, 2026).
- **Audience:** Deeptech founders/researchers (primary), investors, potential collaborators/partners. LATAM-based, bilingual ES/EN with Spanish as default.
- **Current traction:** 400+ community members, 250+ summit attendees, 92+ applicants, 15 fellows.

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
| Next.js 16 over Astro/Remix | SSR + RSC for SEO, mature ecosystem, reference template available | — Pending |
| Keep Framer Motion (not CSS-only) | Existing animations are rich and integral to the brand feel | — Pending |
| Neon serverless over other Postgres | Reference template uses it, serverless = no cold starts for landing page | — Pending |
| Strip auth/payments/uploads from template | Landing page doesn't need them, reduces complexity | — Pending |
| All 4 GEO strategies (JSON-LD, llms.txt, OG, sitemap) | User wants maximum discoverability across human and AI search | — Pending |
| Spanish as default locale | LATAM-focused organization, primary audience speaks Spanish | — Pending |

---
*Last updated: 2026-02-08 after initialization*

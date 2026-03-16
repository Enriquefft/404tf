# 404 Tech Found — Roadmap

> One big release. No individual priorities — organized by logical dependency.

## Decisions Made

| Decision | Resolution |
|----------|------------|
| CMS | **Payload CMS 3.0** — blog only, free, no limits |
| Blog location | **Separate app** `apps/blog/` → `blog.404tf.com` |
| Payload scope | **Blog content only** — report app keeps its own Drizzle/Neon data layer |
| Community section | **Unified ecosystem showcase** — team, startups, partners, report product, all in one |
| Blog categories | **Custom categories + free-form tags** (not tied to houses) |
| Team size | ~9-20 people (3 founders + collaborators/volunteers) |
| Design identity | **Landing has its own branding** — separate from report app's dark/navy/amber direction. Defined during redesign phase |

---

## Phase 0: Content Gathering & Brand Package

Before any code changes, gather all real assets and consolidate shared brand identity.

### 0a. Content Gathering (non-code)

- [ ] **Founder photos** — Professional photos of Oscar Castro, Alejandra Vera, Enrique Flores
- [ ] **AI character avatars** — Generated illustrations for each founder (for Houses section)
- [ ] **Team member info** — Names, roles, photos/avatars for the ~9-20 collaborators and volunteers
- [ ] **Partner logos & info** — No official partners yet (coming soon). Replace placeholders once partnerships are confirmed
- [ ] **Event photos** — Images for the events carousel
- [ ] **Startup portfolio** — Info on startups 404 has supported (logos, descriptions, status)
- [ ] **Blog seed content** — At least 2-3 posts ready for launch (ES + EN)
- [ ] **Custom blog categories** — Define the category taxonomy (e.g. Tutorials, News, Deep Dives, Events, etc.)

### 0b. Brand Package — `packages/brand/`

Consolidate existing brand identity into a single source of truth. There's already a branding direction (Orbitron font, house colors, "404 TECH FOUND" text logo) — this phase migrates it, not reinvents it. Branding is open to evolution during Phase 1 (Design System).

Currently logos live in `apps/landing/public/brand/`, fonts are duplicated in `apps/spechack/public/fonts/`, and the logo export script is orphaned at root `scripts/`.

**Package scaffold:**
- [ ] **Create package** — `packages/brand/` as `@404tf/brand`
- [ ] **Migrate logos** — SVG sources + export script (from root `scripts/` + `apps/landing/public/brand/`)
- [ ] **Migrate fonts** — Orbitron, JetBrains Mono (from `apps/spechack/public/fonts/`)
- [ ] **Org-level tokens** — Core brand colors, logo usage constants (NOT app-specific design systems)
- [ ] **Move devDeps** — `satori`, `@resvg/resvg-js` scoped to this package
- [ ] **Update consumers** — Landing and report import from `@404tf/brand`

**Logo system:**

Current state: one text-based logo ("404 / TECH FOUND" in Orbitron) with multiple color variants (dark, light, transparent) exported at many sizes. No definitive version, no standalone mark.

- [ ] **Define logo variants needed:**
  - **Logomark** — Standalone symbol (favicon, app icons, social avatars, small spaces)
  - **Wordmark** — "404 TECH FOUND" typographic treatment (headers, formal contexts)
  - **Lockup** — Logomark + wordmark combined (primary logo, OG images, splash screens). Consider both horizontal (navbar, tight spaces) and vertical (hero, splash) orientations.
- [ ] **Design logomark** — Needs to work at 16×16 (favicon) through 512×512
- [ ] **Finalize wordmark** — Refine current Orbitron text treatment or explore alternatives
- [ ] **Color variants** — Each logo variant in: on-dark, on-light, transparent backgrounds
- [ ] **Export pipeline** — Update export script to generate all variants × sizes

Deliverable: All apps reference `@404tf/brand` for shared identity. Complete logo system with logomark, wordmark, and lockup. No duplicated brand assets.

### 0c. Remove SpecHack from Monorepo

SpecHack is being retired from the monorepo. Keep `apps/spechack/` code intact (archive) but remove all infrastructure integrations so it's no longer built, linted, or deployed.

**Root config:**
- [ ] `package.json` — Remove `dev:spechack` and `build:spechack` scripts
- [ ] `lefthook.yml` — Remove `types-spechack` pre-commit hook
- [ ] `knip.config.ts` — Remove `apps/spechack` entry
- [ ] `CLAUDE.md` — Remove spechack from monorepo layout and references
- [ ] `README.md` — Remove spechack sections, commands, and Vercel config

**Database:**
- [ ] `packages/database/src/schema.ts` — Remove spechack enums, tables, and type exports
- [ ] Run `bun run db:generate` to create migration dropping spechack tables

**Cleanup:**
- [ ] Run `bun install` to regenerate `bun.lock` without spechack deps
- [ ] `.planning/` docs — Historical, leave as-is (no code impact)

> **Note:** SpecHack references in landing page content (translations, AnnouncementBanner, Navbar badge, Events section, JSON-LD, llms.txt) are removed during Phase 3 when those sections get redesigned.

---

## Phase 1: Design System

Define the landing page's own visual direction. Current design is functional but not memorable — the goal is **bold, maverick, deeptech identity**. This is separate from the report app's design.

- [ ] **Visual audit** — Document what works and what doesn't in the current design
- [ ] **Design tokens** — New typography, expanded color palette, spacing scale, border/radius system
- [ ] **Motion language** — Define animation patterns (transitions, hover states, scroll effects, micro-interactions)
- [ ] **Component library direction** — Establish the visual vocabulary (card styles, buttons, section layouts)
- [ ] **Reference moodboard** — Founders provide visual references → distill into a direction

Deliverable: Design system documented as CSS variables + Tailwind config + reference examples.

---

## Phase 2: New Apps

### 2a. Payload CMS 3.0 — `apps/blog/`

Separate Next.js app in the monorepo, deployed to `blog.404tf.com`.

- [ ] **Scaffold Payload app** — `apps/blog/` with Next.js App Router + Payload CMS 3.0
- [ ] **Database** — Dedicated Neon Postgres DB for blog (separate from landing/report)
- [ ] **i18n** — Field-level localization for ES/EN
- [ ] **Content models:**
  - [ ] `posts` — Title, slug, body (Lexical rich text), author, categories, tags, featured image, locale, publishedAt, featured flag
  - [ ] `categories` — Name, slug, description (e.g. Tutorials, News, Deep Dives)
  - [ ] `authors` — Name, avatar, bio, role (links to team identity)
  - [ ] `media` — Image uploads with optimization
- [ ] **Admin panel** — Customized with 404tf branding
- [ ] **Auth & roles** — Admin (founders), Editor (collaborators)
- [ ] **Blog frontend** — Full blog with category filtering, tag browsing, search, pagination
- [ ] **RSS feed** — Auto-generated from posts
- [ ] **Deployment** — Vercel project for `blog.404tf.com`
- [ ] **API for landing** — Expose endpoint for landing page to fetch featured/recent posts

### 2b. LATAM Deeptech Map — `apps/map/`

Astro app with React islands, deployed to `map.404tf.com`. Full implementation spec lives in `apps/map/implementation.md` (12-step build order) with design tokens in `apps/map/design-spec.jsonc`.

Has its own design system (deep plum / Bricolage Grotesque), separate from landing.

**Depends on:** Phase 0a (startup portfolio data for seeding), Phase 0b (brand package for org logos).

**Must complete before:** Phase 3f (landing's ecosystem section links to `report.404tf.com`).

---

## Phase 3: Landing Page — Section Updates

Apply new design system while updating each section with real content.

### 3a. Founders & Team

- [ ] **Founder photos** — Add real photos to the existing founders/about area
- [ ] **Team carousel** — Horizontal carousel on landing: founders prominent + key team members
- [ ] **Carousel CTA** — Links to dedicated team page
- [ ] **Dedicated team page** (`/[locale]/team`):
  - **Founders** (3) — Large cards with photo, bio, social links
  - **Core Team** — Medium cards
  - **Collaborators & Volunteers** — Grid/list format

### 3b. Houses Section

- [ ] **AI character avatars** — One generated illustration per founder/house
- [ ] **Visual refresh** — Apply new design system to Houses cards

### 3c. Events Section

- [ ] **Image carousel** — Swipeable carousel with real event photos
- [ ] **Event cards redesign** — Apply new design system

### 3d. Partners Section

> **Status:** No official partners at the moment — partnerships coming soon.

- [ ] **Replace placeholders** — Add real partner logos and info once partnerships are finalized
- [ ] **Section redesign** — Apply new design system

### 3e. Blog Banner on Landing

- [ ] **Blog preview component** — Banner/card showing one featured post
- [ ] **Selection heuristic** — Most recent OR recent + popular (weighted score)
- [ ] **CTA** — Links to `blog.404tf.com`
- [ ] **Data fetching** — Server component fetches from Payload API at build/request time

### 3f. Ecosystem Section (replaces "Community")

Unified showcase of the full 404 ecosystem — everything 404 has built and supports:

- [ ] **Startups supported** — Portfolio/alumni grid with logos and brief descriptions
- [ ] **Partners & programs** — Co-created programs with partner branding (pending partner confirmations)
- [ ] **Team highlight** — Key contributors beyond founders (teaser → team page)
- [ ] **Report product showcase** — Feature the LATAM Deeptech Report as a product, CTA to `report.404tf.com`
- [ ] **Impact metrics** — Numbers that tell the story (startups supported, events held, people reached, report coverage)

---

## Phase 4: Full Redesign Pass

With the design system established and sections updated, do a holistic polish:

- [ ] **Hero section** — Redesign to be bold and memorable
- [ ] **Navigation** — Refine (add links: Team, Blog, Report)
- [ ] **Footer** — Update structure (blog, team, report, ecosystem links)
- [ ] **Page transitions** — Smooth route animations
- [ ] **Responsive audit** — Mobile / tablet / desktop
- [ ] **Micro-interactions** — Hover states, scroll reveals, loading states
- [ ] **Typography pass** — Heading hierarchy and readability
- [ ] **Consistency audit** — All sections feel cohesive
- [ ] **Dark mode** — Evaluate if it fits the identity

---

## Phase 5: SEO & Metadata

- [ ] **Meta tags** — Title, description, OG images for all pages (landing, team, blog)
- [ ] **Structured data** — JSON-LD for organization, blog posts, events
- [ ] **Sitemap** — Auto-generated including blog posts and team page
- [ ] **robots.txt** — Proper configuration
- [ ] **Canonical URLs** — Correct handling for ES/EN bilingual routes
- [ ] **OG images** — Dynamic or static Open Graph images per page/post
- [ ] **Performance** — Core Web Vitals optimization (LCP, CLS, INP)
- [ ] **Image optimization** — Next.js Image component, proper sizing, lazy loading
- [ ] **Accessibility** — WCAG compliance check

---

## Architecture Overview

```
404tf.com              → apps/landing/     (Main landing page)
blog.404tf.com         → apps/blog/        (Payload CMS + Blog — NEW)
map.404tf.com          → apps/map/      (LATAM Deeptech Map)

apps/
  landing/             # Landing page (existing, gets redesigned)
  blog/                # Payload CMS 3.0 + blog frontend (new)
  report/              # LATAM Deeptech Report (existing, separate)
  spechack/            # ARCHIVED — code kept, not built or deployed
packages/
  brand/               # Shared 404tf identity (logos, fonts, org tokens)
  database/            # Shared Drizzle ORM + Neon — landing + report
  config/              # Shared tsconfig + biome
```

### Data flow

- **Blog app** owns all blog content via Payload CMS (dedicated Neon DB)
- **Landing app** fetches featured blog posts from Payload API for the blog banner
- **Landing app** manages its own content (team, events, partners, ecosystem) — either hardcoded or pulled from a lightweight data source
- **Report app** has its own data layer (startup directory, analytics) — no Payload dependency
- Each app has its own Vercel deployment and domain

# SpecHack — Hackathon Landing Page

## What This Is

SpecHack is the landing page and registration platform for 404 Tech Found's global hackathon. It's a bilingual (ES/EN) Next.js 16 app within the 404tf monorepo, migrated from a Vite/React SPA prototype. Participants register, receive a unique trading card identity, and can challenge friends to join via shareable links with dynamic social previews.

## Core Value

Participants can register for the hackathon and receive a shareable trading card identity that drives viral recruitment through challenge links.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Migration (faithful port of existing blueprint):**
- [ ] Navbar with bilingual toggle, desktop/mobile responsive, scroll-aware background
- [ ] Hero section with registration form (name, email, city, track toggle)
- [ ] Trading card system — card generation on registration, Canvas PNG export, card reveal animation
- [ ] Challenge page at `/c/[name]` with deterministic card generation and registration form
- [ ] Manifesto section with bold text rendering and phase cards (Plan → Build → Present)
- [ ] Judging & Prizes section with criteria progress bars and prize list
- [ ] Hubs section with city map, ambassador pitch, and ambassador application form
- [ ] Sponsors section with metrics, value props, and CTAs
- [ ] FAQ section with expandable accordion items
- [ ] Footer with logo, navigation links, social links
- [ ] Sticky register button that appears on scroll past hero
- [ ] All content bilingual (ES/EN) via next-intl with URL-prefix routing
- [ ] Dark theme with purple/cyan accent colors, blueprint grid background, Orbitron/JetBrains Mono fonts
- [ ] Framer Motion animations throughout (fade-in, scroll-triggered, card reveal stagger)

**Backend features (new — blocked in Vite version):**
- [ ] DB-backed registrations — store participant data in Neon Postgres, assign persistent sequential agent numbers
- [ ] DB-backed ambassador applications — store hub ambassador form submissions
- [ ] Dynamic OG images for challenge links — server-rendered card preview image for social media sharing at `/c/[name]`

### Out of Scope

- Email notifications on registration — deferred, DB-only for now
- Referral tracking / analytics — requires backend instrumentation, not in v1
- Real-time participant counter — would need WebSocket/polling, unnecessary for launch
- OAuth / social login — registration is simple form only
- Mobile app — web-only
- Payment processing — free event

## Context

**Source blueprint:** `~/Projects/spechack-blueprint` — a Lovable-generated Vite/React SPA with shadcn/ui, Tailwind CSS v3, React Router, and Framer Motion. All features are client-side only (localStorage for card data, console.log for form submissions). The blueprint is feature-complete except for 2 backend tasks that were impossible in a static SPA.

**Monorepo context:** Lives at `apps/spechack/` in the 404tf monorepo alongside `apps/landing/`. Shares `@404tf/database` (Drizzle ORM + Neon Postgres) and `@404tf/config` (Biome, tsconfig). The landing app has established patterns for next-intl, Tailwind v4, server components, and form handling with `useActionState`.

**Key migration translations:**
- React Router → Next.js App Router with `[locale]` dynamic segment
- LanguageContext + i18n.ts object → next-intl with JSON message files
- shadcn/ui Accordion → Custom Tailwind v4 component (only component needed)
- Client-side form → Server Action + `useActionState` + Zod validation
- localStorage card storage → Neon Postgres
- Static HTML → Dynamic metadata + OG image generation via `next/og`
- Tailwind v3 HSL variables → Tailwind v4 CSS custom properties with `@theme`

**Existing DB pattern:** Schema uses `pgSchema("404 Tech Found")` with `landing_` enum prefix. SpecHack tables will use `spechack_` prefix for enums and clear table names.

**Trading card system:** 6 builder classes, deterministic card generation from name hash (gradient + class), Canvas API for PNG export, challenge links at `/c/[first-name]`. Agent numbers currently random — will become sequential from DB.

## Constraints

- **Tech stack**: Must use monorepo conventions — Bun, Biome (tabs, double quotes), Next.js 16, Tailwind v4 (~4.0.0), next-intl, Drizzle ORM
- **No shadcn/ui**: Port the few needed components (Accordion) directly to Tailwind v4
- **Shared database**: Use existing `@404tf/database` package, add spechack tables with `spechack_` prefix
- **Tailwind v4**: No `@apply` with theme variables — use direct CSS with `@theme` declarations
- **proxy.ts**: Must be at `src/proxy.ts` (same level as `app/`), not inside `src/app/`
- **No default exports**: Except Next.js special files (page, layout, etc.)
- **Server-first**: Static content as server components, client components only for interactivity

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| next-intl over simple toggle | SEO-friendly URLs, consistent with landing app, proper SSR i18n | — Pending |
| Shared Neon DB over separate | One connection, consistent patterns, shared schema package | — Pending |
| Port Accordion over shadcn/ui | Only 1 component needed, avoids heavy dependency, Tailwind v4 compatible | — Pending |
| DB-only submissions (no email) | Simplifies v1, emails can be added later | — Pending |
| Sequential agent numbers from DB | Eliminates collisions, enables consistent identity | — Pending |
| next/og for OG images | Built into Next.js, no external service needed, works with Vercel | — Pending |

---
*Last updated: 2026-02-13 after initialization*

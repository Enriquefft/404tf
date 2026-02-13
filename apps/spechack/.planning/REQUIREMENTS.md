# SpecHack — Requirements

## v1 Requirements

### Foundation (FOUND)

- [ ] **FOUND-01**: App bootstraps as Next.js 16 with App Router, Tailwind v4 (~4.0.0), and Biome formatting (tabs, double quotes)
- [ ] **FOUND-02**: next-intl configured with `[locale]` segment, always-prefix routing (`/es/`, `/en/`), and `proxy.ts` at `src/proxy.ts`
- [ ] **FOUND-03**: Dark theme with purple/cyan accents, blueprint grid background, Orbitron + JetBrains Mono + Inter fonts loaded via CSS
- [ ] **FOUND-04**: Framer Motion wrappers created as reusable client components (MotionDiv, MotionSection, etc.) to avoid client component cascade
- [ ] **FOUND-05**: Shared database package (`@404tf/database`) extended with `spechack_` prefixed tables for registrations and ambassador applications

### Landing Sections (LAND)

- [ ] **LAND-01**: User sees responsive Navbar with bilingual toggle, scroll-aware background, desktop links, and mobile hamburger menu
- [ ] **LAND-02**: User sees Hero section with headline, sub-headline, event date, and "How it works" anchor link
- [ ] **LAND-03**: User sees registration form in Hero (name, email, city, track toggle: Virtual/Hub) with submit button
- [ ] **LAND-04**: User sees Manifesto section with bold-rendered paragraphs, bridge line, and 3 phase cards (Plan → Build → Present)
- [ ] **LAND-05**: User sees Judging section with 5 criteria progress bars (animated on scroll) and 5 prize categories
- [ ] **LAND-06**: User sees Hubs section with city map (6 cities, 1 confirmed), ambassador pitch, and expandable application form
- [ ] **LAND-07**: User sees Sponsors section with 3 metrics, 3 value props, deck download CTA, and book-a-call CTA
- [ ] **LAND-08**: User sees FAQ section with 4 expandable accordion items (custom component, no shadcn)
- [ ] **LAND-09**: User sees Footer with SpecHack logo, 404 Tech Found parent logo, nav links, social links, and contact email
- [ ] **LAND-10**: User sees sticky "Register" button that appears when scrolled past the hero registration form
- [ ] **LAND-11**: All section content displayed in the user's selected language (ES or EN) based on URL locale prefix

### Trading Cards (CARD)

- [ ] **CARD-01**: After registration, user sees animated card reveal with their unique trading card (staggered animation: scale, rotate, fade)
- [ ] **CARD-02**: Trading card displays: agent number (SPEC-XXXX), name, city + country flag, track badge, builder class name + description, event branding
- [ ] **CARD-03**: Card visual uses deterministic gradient derived from name hash (8 gradient combos, angle 120-240deg)
- [ ] **CARD-04**: Builder class randomly assigned from 6 classes (The Architect, The Prototyper, The Full-Stack Maverick, The Mad Scientist, The Systems Thinker, The Debug Whisperer)
- [ ] **CARD-05**: User can download their card as PNG via Canvas API (600x800px, programmatic rendering)
- [ ] **CARD-06**: User can share on X (pre-filled tweet with agent number, builder class, and challenge link)
- [ ] **CARD-07**: User can share challenge link via WhatsApp, LinkedIn, or copy-to-clipboard
- [ ] **CARD-08**: Hero section shows fanned preview of 4 example trading cards with hover animation and "Register and get yours" tagline
- [ ] **CARD-09**: Card data persisted — returning users see their card (via DB lookup or localStorage fallback)

### Challenge System (CHAL)

- [ ] **CHAL-01**: User can visit `/[locale]/c/[name]` and see a deterministic trading card for that name (same name = same gradient, builder class, agent number)
- [ ] **CHAL-02**: Challenge page displays "[Name] challenges you to join" header with "Do you accept?" prompt
- [ ] **CHAL-03**: Challenge page includes registration form — after submitting, user sees their own card reveal
- [ ] **CHAL-04**: Challenge links generate dynamic OG image showing the challenger's trading card for social media previews

### Registration Backend (REG)

- [ ] **REG-01**: Registration form submission creates a record in Neon Postgres via Server Action with Zod validation
- [ ] **REG-02**: Agent numbers assigned sequentially from database (SPEC-0001, SPEC-0002, ...) — no collisions
- [ ] **REG-03**: Duplicate email submissions handled gracefully (return existing card data, don't create duplicate)
- [ ] **REG-04**: Registration stores: name, email, city, track (virtual/hub), agent number, builder class, gradient data, locale, created_at

### Ambassador Backend (AMB)

- [ ] **AMB-01**: Ambassador application form submission creates a record in Neon Postgres via Server Action with Zod validation
- [ ] **AMB-02**: Application stores: name, email, city, community description, locale, created_at

### SEO & Metadata (SEO)

- [ ] **SEO-01**: Landing page has proper static metadata (title, description, OG image) for both locales
- [ ] **SEO-02**: Challenge pages (`/c/[name]`) have dynamic metadata with the challenger's name in title and description
- [ ] **SEO-03**: Challenge pages generate dynamic OG image (1200x630) using `next/og` ImageResponse showing a styled card preview with the challenger's name, agent number, and builder class

## v2 Requirements (Deferred)

- Email confirmation on registration
- Referral tracking / analytics dashboard
- Real-time participant counter
- Team formation features
- Admin dashboard for managing registrations
- Custom OG images with actual card rendering (v1 uses simplified ImageResponse layout)
- Schedule/timeline section
- Speaker/judge profiles

## Out of Scope

- OAuth / social login — registration is simple form, no auth needed
- Payment processing — free event
- Mobile app — web-only
- Real-time features (WebSocket/polling) — static content sufficient
- CMS for content editing — content is in translation files
- Search functionality — single-page landing, no search needed

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| LAND-01 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |
| LAND-03 | Phase 2 | Pending |
| LAND-04 | Phase 2 | Pending |
| LAND-05 | Phase 2 | Pending |
| LAND-06 | Phase 2 | Pending |
| LAND-07 | Phase 2 | Pending |
| LAND-08 | Phase 2 | Pending |
| LAND-09 | Phase 2 | Pending |
| LAND-11 | Phase 2 | Pending |
| LAND-10 | Phase 3 | Pending |
| CARD-01 | Phase 5 | Pending |
| CARD-02 | Phase 5 | Pending |
| CARD-03 | Phase 5 | Pending |
| CARD-04 | Phase 5 | Pending |
| CARD-05 | Phase 5 | Pending |
| CARD-06 | Phase 5 | Pending |
| CARD-07 | Phase 5 | Pending |
| CARD-08 | Phase 5 | Pending |
| CARD-09 | Phase 5 | Pending |
| CHAL-01 | Phase 6 | Pending |
| CHAL-02 | Phase 6 | Pending |
| CHAL-03 | Phase 6 | Pending |
| CHAL-04 | Phase 6 | Pending |
| REG-01 | Phase 4 | Pending |
| REG-02 | Phase 4 | Pending |
| REG-03 | Phase 4 | Pending |
| REG-04 | Phase 4 | Pending |
| AMB-01 | Phase 4 | Pending |
| AMB-02 | Phase 4 | Pending |
| SEO-01 | Phase 4 | Pending |
| SEO-02 | Phase 6 | Pending |
| SEO-03 | Phase 6 | Pending |

---
*Last updated: 2026-02-13 after roadmap creation*

# 404 Mapped — Build Status

## Decisions Made (2026-03-25)

- **Foundry brand synced** — house colors + Space vertical updated in CSS + design spec
- **Corporate modal: 2 steps** (was 3) — budget/verticals removed, less friction
- **PDF gate: 2 fields** (was 4) — name + email only
- **Dot-grid map: full custom SVG** — hero (decorative) + directory (interactive)
- **Directory map simplifications** — cut clustering + drag-resize; mobile gets toggle
- **AI translations** — Claude translates ES→EN, manual review before launch
- **100+ target** — launch with 60, expand to 100+ in Phase B (parallel)
- **One sprint** — all 6 pages + all phases, no v2 deferrals

## Build Order (13 steps + 3 phases)

### Phase A: Platform

| Step | What | Status | Blocker |
|------|------|--------|---------|
| 1 | Project scaffolding (nav, footer, i18n, PostHog) | 50% | None |
| 2 | Data preparation (CSV→JSON, translate, geocode, enum map) | 0% | None |
| 3 | Database schema (5 tables, enums, seed 60 startups) | 0% | Step 2 |
| 4 | Shared components (Button, Input, Card, Badge, Modal, etc.) | 0% | Step 1 |
| 5 | Corporate modal (2-step form + API + Resend) | 0% | Steps 3, 4 |
| 6 | Landing page (dot-grid hero, featured startups, data preview, dual conversion) | 0% | Steps 3, 4, 5 |
| 7 | Directory page (interactive map, filters, card grid) | 0% | Steps 3, 5, 6 |
| 8 | Startup profile page (dynamic [slug], sidebar CTA, related startups) | 0% | Steps 3, 5 |
| 9 | Insights page (charts, PDF gate, data story) | 0% | Steps 3, 5 |
| 10 | For Startups page (2 forms, 2 API endpoints) | 0% | Steps 3, 4 |
| 11 | About / Methodology (static content, team cards) | 0% | Step 4 |
| 12 | Claim flow (form + API + Resend notification) | 0% | Steps 3, 8 |
| 13 | Polish (responsive, a11y, SEO, perf, analytics, i18n pass) | 0% | All |

### Parallel Phases

| Phase | What | Status | When |
|-------|------|--------|------|
| B | Data expansion (40+ more startups → 100+ total) | 0% | During Steps 6-9 |
| C | Analysis & statistics (insights data, PDF report) | 0% | After Phase B |
| D | Images & final polish (logos, photos, OG images) | 0% | During Phase C |

## Design System Status

- [x] CSS variables synced to Foundry house colors
- [x] Space vertical added (--v-space: #00A0F0)
- [x] @theme inline bindings for all 13 verticals
- [x] Typography (Bricolage Grotesque / Space Grotesk / Plus Jakarta Sans)
- [x] Dependencies installed (React, Recharts, Zod, Resend, PostHog, @astrojs/react)

## Intentional Differences from Landing (Foundry)

- Primary purple: #7C3AED (cooler, institutional) vs Foundry's #8E2CD7 (warmer)
- Typography: editorial (Bricolage/Space Grotesk) vs industrial (Big Shoulders/Barlow)
- Radius: 0.5rem vs 0rem
- Backgrounds: nearly identical deep plum (#0A0710 ≈ #0F080F)

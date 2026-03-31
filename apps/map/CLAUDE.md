# 404 Mapped — Project Rules

Bilingual (ES/EN) LATAM deeptech startup directory. Astro app with React islands, deployed to `map.404tf.com`.

These rules are non-negotiable. Every agent, every file, every line.

## Quality Bar

- Only robust, long-term correct & scalable implementations.
- Zero workarounds, bandaids, hacks, or "fix later" TODOs.
- Production & enterprise ready software is the goal.
- If something is hard to do right, do it right anyway.
- Single source of truth is a must.

## Tech Stack

- **Runtime:** Bun (not npm/yarn). Use `bun run`, `bun add`.
- **Framework:** Astro 5 with hybrid output (`output: "hybrid"`) + `@astrojs/vercel` adapter
- **Interactive:** React 19 islands via `@astrojs/react` — use `client:load` or `client:visible`
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 pinned to `~4.0.0` + CSS variables from `src/styles/globals.css`
- **Linting:** Biome (shared config at `packages/config/biome.jsonc`) — tabs, double quotes, 100 char width
- **Database:** Drizzle ORM + Neon Postgres (shared `packages/database`). Map tables use `map_` prefix.
- **Validation:** Zod (server-side on API routes, client-side on forms)
- **Charts:** Recharts (React islands)
- **Email:** Resend (notifications on form submissions)
- **Analytics:** PostHog
- **i18n:** Astro native routing — locales: `es` (default), `en` — prefix: `always`
- **Deployment:** Vercel (hybrid mode — static pages + serverless API routes)

## TypeScript

- **Never use `any`**. Use `unknown` + runtime validation, generics, or explicit types.
- **Never use `as` type casting** (except `as const`). Use type guards, Zod parse, or structural fixes. Only `as` if genuinely no other way — and document why.
- Derive types from sources (Zod `z.infer`, Drizzle `$inferSelect`, pgEnum). Never duplicate. SSOT.

## Biome / Linting

- **Never silence warnings or errors with biome-ignore comments** unless genuinely no fix. Fix the code.
- Run `bun run lint` before considering any step done. Zero errors required.

## Code Conventions

- Named exports only (except config files: `astro.config.ts`, `drizzle.config.ts`).
- `kebab-case` for file names, `PascalCase` for components/types, `camelCase` for variables/functions.
- Import with `.ts` / `.tsx` extensions where required by Astro.
- `@/` path alias resolves to `./src/*`.
- Astro components: `.astro` files for static content. React `.tsx` for interactive islands.
- No default exports from components. Astro pages are the exception (Astro requires default export for pages).

## Project Structure

```
apps/map/
├── src/
│   ├── pages/              # Astro pages + API routes
│   │   ├── en/             # English routes
│   │   ├── es/             # Spanish routes
│   │   └── api/            # API routes (serverless on Vercel)
│   │       └── leads/      # Form submission endpoints
│   ├── components/         # Shared components
│   │   ├── ui/             # Base components (Button, Input, Card, Badge, Modal)
│   │   ├── map/            # Dot-grid map React islands
│   │   ├── forms/          # Form React islands (CorporateModal, StartupApply)
│   │   └── charts/         # Recharts React islands
│   ├── layouts/            # Astro layouts (BaseLayout, PageLayout)
│   ├── styles/             # CSS (globals.css = design tokens)
│   ├── i18n/               # Translation files (en.json, es.json)
│   ├── lib/                # Utilities, helpers
│   │   ├── db.ts           # Drizzle client + queries
│   │   ├── email.ts        # Resend helpers
│   │   └── analytics.ts    # PostHog helpers
│   └── data/               # Static data (seed JSON, map dot coordinates)
├── public/
│   ├── images/startups/    # Startup logos + hero images by [slug]
│   └── brand/              # Synced from packages/brand
├── implementation.md       # Full spec (single source of truth for WHAT to build)
├── design-spec.jsonc       # Design tokens (single source of truth for HOW it looks)
├── data.csv                # Raw startup data (Spanish, pre-processing)
└── todo.md                 # Build status tracker
```

## Key Architecture Patterns

### Astro + React Islands

```
Static Astro shell (HTML, SEO, layout, content)
  └── React islands where interaction is required:
        ├── DotGridMap (client:load)     — SVG map with hover/click
        ├── DirectoryFilter (client:load) — search, filter chips, card grid
        ├── CorporateModal (client:load)  — 2-step conversion form
        ├── InsightChart (client:visible)  — Recharts visualizations
        └── MultiStepForm (client:load)   — startup application forms
```

- Static content = Astro components. Zero JS shipped.
- Interactive features = React `client:load` (above fold) or `client:visible` (below fold).
- Never wrap an entire page in a React island. Only the interactive part.

### API Route Pattern

All 5 POST endpoints follow the same structure:

```typescript
// src/pages/api/leads/corporate.ts
export const prerender = false; // SSR — runs as serverless function

export async function POST({ request }: APIContext) {
  const body = await request.json();
  const parsed = corporateLeadSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  await db.insert(mapCorporateLeads).values(parsed.data);
  await sendNotification("corporate-lead", parsed.data);
  return Response.json({ success: true });
}
```

### Data Flow

```
Build time:  Neon DB → Drizzle query → Astro getStaticPaths → prerendered HTML
Runtime:     Form submit → API route → Zod validate → Drizzle insert → Resend email → JSON response
```

- All startup pages are prerendered at build time. No runtime DB queries for reads.
- Directory filtering is 100% client-side (startup data embedded as JSON at build time).
- Only form submissions hit the server at runtime (5 API routes).

### i18n Pattern

```
src/pages/
  en/
    index.astro          → /en
    directory.astro      → /en/directory
    startup/[slug].astro → /en/startup/novabio
    insights.astro       → /en/insights
    startups.astro       → /en/startups
    contact.astro        → /en/contact
    about.astro          → /en/about
  es/
    index.astro          → /es
    directorio.astro     → /es/directorio
    startup/[slug].astro → /es/startup/novabio
    perspectivas.astro   → /es/perspectivas
    startups.astro       → /es/startups
    contacto.astro       → /es/contacto
    nosotros.astro       → /es/nosotros
```

- UI strings from `src/i18n/{en,es}.json`
- Startup data uses `one_liner` (EN) / `one_liner_es` (ES) fields. Fallback to EN if ES is null.
- Startup slugs are language-independent (same slug in both /en and /es).

## Database

- Tables live in the shared `packages/database/src/schema.ts` but use `map_` prefix for all map-specific tables and enums.
- 5 tables: `map_startups`, `map_corporate_leads`, `map_startup_applications`, `map_startup_program_inquiries`, `map_report_downloads`
- Enums: `map_maturity_level` (rd, prototype, pilot, revenue), `map_vertical` (9 values), `map_application_status` (new, reviewed, accepted, rejected)
- Use `bun run db:generate` and `bun run db:push` for migrations.

## Design System

- All visual tokens in `src/styles/globals.css` (100+ CSS variables).
- Design spec: `design-spec.jsonc` (colors, typography, spacing, components, animation).
- Deep plum dark theme (`#0A0710` bg). NOT the same as the landing app's Foundry theme.
- Typography: Bricolage Grotesque (display), Space Grotesk (headings), Plus Jakarta Sans (body), JetBrains Mono (code).
- 9 verticals with assigned colors: AI, Biotech, Hardware, Cleantech, Agritech, Healthtech, Advanced Materials, Aerospace, Quantum.
- No Blockchain/Fintech in taxonomy — not deeptech.

## Conversion Design

- **Corporate is primary audience.** All CTAs and visual weight favor the corporate conversion path.
- **Corporate modal triggers from 6+ locations.** Also available as standalone `/contact` page for sharing/bookmarking.
- **Corporate form: 2 steps only.** Less friction = more leads.
- **PDF gate: name + email only.** Each extra field drops conversion ~10%.
- **No fabricated social proof.** Use "First edition, 2026" not "200+ leaders."

## Commands

```bash
bun run dev              # Start Astro dev server
bun run build            # Build for production
bun run preview          # Preview production build
bun run lint             # Biome check + fix
bun run check            # Biome check only
bun run db:generate      # Generate Drizzle migration
bun run db:push          # Apply migration to Neon
```

## Important Gotchas

- **Tailwind v4** pinned to `~4.0.0` — v4.1+ has bugs with Astro/Vite.
- **API routes need `export const prerender = false`** — otherwise Astro tries to prerender them as static pages.
- **React islands need `client:load` or `client:visible`** — without a client directive, React components render as static HTML with no interactivity.
- **Startup slugs in `[slug].astro`** paths need single quotes in bash to avoid zsh glob expansion.
- **`output: "hybrid"`** means pages are static by default, opt-in to SSR per-page with `export const prerender = false`.
- **Dot-grid map is time-boxed to 16 hours.** If not working at 16h, ship static SVG fallback.

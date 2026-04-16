# 404 Mapped — Project Rules

Bilingual (ES/EN) LATAM deeptech startup directory. Astro 5 + React islands, Vercel hybrid.

Full spec: `implementation.md` (what to build). Visual tokens (shared): `@404tf/brand/theme.css` (Foundry direction). Map sub-branding: `src/styles/globals.css`. Narrative brand book: `packages/brand/brand-book.md`.

## Quality Bar

- Only robust, long-term correct & scalable implementations.
- Zero workarounds, bandaids, hacks, or "fix later" TODOs.
- If something is hard to do right, do it right anyway.
- Single source of truth is a must.

## Tech Stack

- **Runtime:** Bun (not npm/yarn)
- **Framework:** Astro 5 — `output: "hybrid"`, `@astrojs/vercel` adapter
- **Interactive:** React 19 islands — `client:load` (above fold) or `client:visible` (below fold). Never wrap entire pages.
- **Styling:** Tailwind CSS v4 `~4.0.0` + CSS vars from `src/styles/globals.css`
- **Linting:** Biome (shared `packages/config/biome.jsonc`) — tabs, double quotes, 100 chars
- **Database:** Drizzle ORM + Neon Postgres. Map tables use `map_` prefix. 5 tables, 3 enums.
- **Validation:** Zod (server + client)
- **Charts:** Recharts
- **Email:** Resend
- **Analytics:** PostHog
- **i18n:** Astro native — `es` default, `en`, prefix always

## TypeScript

- **Never `any`**. Use `unknown` + validation, generics, or explicit types.
- **Never `as`** (except `as const`). Use type guards, Zod parse, or structural fixes.
- Derive types from sources (`z.infer`, `$inferSelect`, pgEnum). Never duplicate.

## Biome

- **Never `biome-ignore`** unless genuinely no fix. Fix the code.
- Zero errors before any step is done.

## Icons

- **Single source of truth:** [Solar Icons](https://solar-icons.vercel.app/) — no other icon library.
- **Package:** `@solar-icons/react` (installed, for use inside React islands only).
- **Styles available:** Bold, Linear, Outline. Prefer **Linear** for UI, **Bold** for emphasis/CTAs.
- **In .astro files (preferred):** Copy SVG markup from Solar Icons site into inline `<svg>`. Create reusable `.astro` icon components in `src/components/icons/` when used more than once.
- **In .tsx React islands:** `import { IconName } from "@solar-icons/react/linear"`. Only when the component is already a React island for interactivity.
- **Never** wrap an icon in a React island just to use the React package. Icons are static.

## Code Conventions

- Named exports only (except Astro pages + config files).
- `kebab-case` files, `PascalCase` components/types, `camelCase` variables/functions.
- `@/` alias → `./src/*`.
- `.astro` for static, `.tsx` for interactive islands.

## API Route Pattern

All POST endpoints: `export const prerender = false` + Zod validate + Drizzle insert + Resend notify + JSON response.

## Data Flow

- **Request time:** Pages SSR from Neon on demand. Each page sets
  `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` and a
  `Vercel-Cache-Tag` response header so Vercel's CDN holds the rendered HTML.
- **Invalidation:** Admin writes to the DB, then `POST /api/revalidate` with
  the affected tags — Vercel purges only those cache entries, the next request
  regenerates that page from Neon. No full rebuild, no snapshot file.
- **Directory filters:** Filtering happens client-side over the initial SSR'd
  payload (embedded as JSON in the page), so filter interactions don't hit
  the DB.
- **Tag registry:** `src/lib/cache-tags.ts` — single source of truth for every
  tag string. Pages and the revalidate endpoint both import from here.

## Conversion Rules

- Corporate is primary audience. All CTA weight favors corporate path.
- Corporate form: 2 steps. PDF gate: 2 fields (name + email).
- Modal + standalone `/contact` page (shareable URL).
- No fabricated social proof.

## Commands

```bash
bun run dev          # Astro dev server
bun run build        # Production build
bun run lint         # Biome check + fix
bun run db:generate  # Drizzle migration
bun run db:push      # Apply to Neon
```

## Revalidation

After DB changes (new startups, profile edits), purge only the affected CDN
cache entries instead of redeploying. Pages SSR from Neon on demand and are
held in Vercel's CDN behind a `Vercel-Cache-Tag` response header; purging a
tag marks the entry stale and the next request regenerates it.

- **API:** `POST /api/revalidate`
- **Auth:** `Authorization: Bearer $ADMIN_REBUILD_TOKEN`
- **Body:** `{ "tags": ["startup-<slug>", "directory", ...], "paths": ["/en/..."] }`
  — at least one non-empty array is required.
- **Tag registry:** `src/lib/cache-tags.ts` exports the canonical tag builders
  (`CACHE_TAGS.startup("notco")`, `CACHE_TAGS.directory`, etc). Both SSR pages
  and this endpoint import from the registry so tags can never drift.
- **Paths:** Vercel CDN has no first-class path invalidation, so `paths` are
  sent as tags of the form `path:<path>`. SSR pages that want to be
  invalidatable by path must include a matching `path:<path>` entry in their
  `Vercel-Cache-Tag` header.
- **Env vars:** `ADMIN_REBUILD_TOKEN`, `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`,
  optional `VERCEL_TEAM_ID` (only when the project lives under a team scope).
  Create the API token at https://vercel.com/account/tokens.

### Triggering revalidation

```bash
curl -X POST https://map.404tf.com/api/revalidate \
  -H "Authorization: Bearer $ADMIN_REBUILD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["startup-notco", "directory"]}'
```

Response on success: `{ "invalidated": { "tags": [...], "paths": [...] }, "errors": [] }`.
Partial failures still return 200 with per-batch entries in `errors`; a total
upstream failure returns 502.

## Build Pipeline

`bun run build` runs `astro build`. Pages are SSR'd at request time from Neon
via Drizzle — there is no seed snapshot or build-time DB dump. Database is
the single source of truth; Vercel's CDN (tag-keyed) is the cache layer.

## Gotchas

- Tailwind v4 pinned `~4.0.0` — v4.1+ breaks with Astro/Vite
- API routes MUST have `export const prerender = false`
- React islands MUST have `client:load` or `client:visible` directive
- `[slug].astro` paths need single quotes in bash (zsh glob)
- `output: "hybrid"` = static default, opt-in SSR per-route
- Dot-grid map time-boxed to 16 hours — ship static SVG fallback if over
- 9 verticals only — no Blockchain, no Fintech (not deeptech)

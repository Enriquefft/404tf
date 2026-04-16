# 404 Mapped

Bilingual (ES/EN) LATAM deeptech directory. Astro 5 hybrid + React islands on Vercel.

Full spec: `implementation.md`. Shared brand tokens: `@404tf/brand/theme.css`. Map overrides: `src/styles/globals.css`.

## TypeScript

- No `any`. Use `unknown` + Zod, generics, or explicit types.
- No `as` except `as const`. Use type guards or `z.parse`.
- Derive types from the source: `z.infer`, `$inferSelect`, `pgEnum`. Never duplicate.

## Biome

- No `biome-ignore` unless there is genuinely no fix.
- Zero errors before any step is done.

## Repo-specific rules

- Tailwind pinned `~4.0.0`. v4.1+ breaks Astro/Vite — do not bump.
- API routes (`src/pages/api/**`) MUST `export const prerender = false`.
- React islands MUST carry `client:load` (above fold) or `client:visible` (below). Never wrap a whole page.
- Astro i18n: `es` default, `en` secondary, prefix always (`/es/...`, `/en/...`).
- DB tables use `map_` prefix (5 tables, 3 enums in `packages/database/`).
- Only 9 deeptech verticals — no Blockchain, no Fintech.

## Icons

Solar Icons only (`@solar-icons/react`, Linear style default). Prefer inline SVG in `.astro`; import the React package only inside existing islands. Never create an island just to render an icon.

## API route pattern

POST endpoints: `prerender = false` → Zod validate → Drizzle insert → Resend notify (fire-and-forget) → JSON response.

## Data flow & cache

- Pages SSR from Neon on demand. Each page sets `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` and a `Vercel-Cache-Tag` header.
- Directory filtering is client-side over the SSR'd JSON payload — do not re-query the DB for filter changes.
- Revalidation: `POST /api/revalidate` with `Authorization: Bearer $ADMIN_REBUILD_TOKEN` and `{tags, paths}`. Path invalidation is encoded as a `path:<path>` tag.
- **All cache tag strings come from `src/lib/cache-tags.ts`.** SSR pages and the revalidate endpoint both import from this registry — never hardcode a tag.

Env required for revalidation: `ADMIN_REBUILD_TOKEN`, `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, optional `VERCEL_TEAM_ID`.

## Gotchas

- `[slug].astro` paths in bash need single quotes (zsh glob).
- `output: "hybrid"` = static default; SSR is opt-in per route via `prerender = false`.

# 404 Mapped — Project Rules

Bilingual (ES/EN) LATAM deeptech startup directory. Astro 5 + React islands, Vercel hybrid.

Full spec: `implementation.md` (what to build). Design tokens: `design-spec.jsonc` (how it looks).

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

- **Build time:** Neon → Drizzle → `getStaticPaths` → static HTML. No runtime DB reads.
- **Runtime:** Only form submissions (5 API routes).
- **Directory:** 100% client-side filtering, startup data embedded as JSON at build.

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

## Gotchas

- Tailwind v4 pinned `~4.0.0` — v4.1+ breaks with Astro/Vite
- API routes MUST have `export const prerender = false`
- React islands MUST have `client:load` or `client:visible` directive
- `[slug].astro` paths need single quotes in bash (zsh glob)
- `output: "hybrid"` = static default, opt-in SSR per-route
- Dot-grid map time-boxed to 16 hours — ship static SVG fallback if over
- 9 verticals only — no Blockchain, no Fintech (not deeptech)

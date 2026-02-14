# 404 Tech Found

Bilingual (ES/EN) Next.js 16 landing page for a tech community. Monorepo with Bun workspaces.

## Tech Stack

- **Runtime:** Bun (not npm/yarn). Use `bun run`, `bun install`, `bun add`.
- **Framework:** Next.js 16 with App Router and Turbopack (`next dev --turbopack`)
- **Language:** TypeScript (strict mode, ESNext target)
- **Styling:** Tailwind CSS v4 pinned to `~4.0.0` (v4.1+ has Turbopack bugs)
- **Linting:** Biome — tabs, double quotes, 100 char line width
- **i18n:** next-intl — locales: `es` (default), `en` — prefix: `always`
- **Database:** Drizzle ORM + Neon Postgres (serverless)
- **Validation:** Zod
- **Animations:** Framer Motion
- **Deployment:** Vercel
- **Git hooks:** Lefthook + commitlint-rs (conventional commits)

## Monorepo Layout

```
apps/landing/          # Main landing page (active development)
apps/spechack/         # Secondary app
packages/database/     # Drizzle ORM + Neon (shared)
packages/config/       # Shared tsconfig + biome.jsonc
```

## Key Paths (landing app)

| Purpose | Path |
|---------|------|
| Pages/routes | `apps/landing/src/app/[locale]/` |
| Components | `apps/landing/src/app/[locale]/_components/` |
| Server actions | `apps/landing/src/app/[locale]/_actions/` |
| Animations | `apps/landing/src/app/[locale]/_components/animations/` |
| Hooks | `apps/landing/src/hooks/` |
| Utilities | `apps/landing/src/lib/` |
| SEO/metadata | `apps/landing/src/lib/metadata/` |
| Analytics | `apps/landing/src/lib/analytics/` |
| i18n config | `apps/landing/src/i18n/` |
| Translations | `apps/landing/messages/{es,en}.json` |
| Styles | `apps/landing/src/styles/globals.css` |
| i18n middleware | `apps/landing/src/proxy.ts` |
| DB schema | `packages/database/src/schema.ts` |
| Biome config | `packages/config/biome.jsonc` |

## Commands

```bash
bun run dev              # Start landing app (Turbopack)
bun run build            # Build all apps
bun run lint             # Biome check + fix
bun run check            # Biome check only
bun run check:deps       # Knip unused dependency check
bun run db:generate      # Generate Drizzle migration
bun run db:push          # Apply migration to Neon
bun run db:studio        # Open Drizzle Studio
```

## Code Conventions

- **Components:** PascalCase files (`Hero.tsx`), named exports (`export function Hero()`), no default exports (except Next.js special files)
- **Hooks:** `use` prefix, camelCase (`useScrollDirection.ts`)
- **Server actions:** `.actions.ts` suffix (`intent.actions.ts`)
- **Private dirs:** Underscore prefix (`_components/`, `_actions/`)
- **Imports:** Always use `@/` path alias (maps to `./src/`). Order: React/Next → third-party → workspace packages → local `@/` imports
- **Types:** Props as `type {Name}Props = { ... }` above component. No barrel files.
- **No default exports** except Next.js pages/layouts/error boundaries

## Architecture Patterns

- **Server-first:** Async server components for static content, client components only when interactive
- **Translation prop-drilling:** Server components call `getTranslations()`, pass translated strings as props to client components (no runtime dictionary lookups)
- **Form handling:** `useActionState` + Server Actions + Zod validation → returns `FormState` object
- **Animations:** `<FadeInSection>` wrapper for scroll-triggered reveals (Framer Motion)
- **i18n routing:** Always-prefix pattern — all URLs start with `/es/` or `/en/`

## Important Gotchas

- **proxy.ts location:** Must be at `src/proxy.ts` (same level as `app/`), NOT inside `src/app/`
- **Tailwind v4:** Don't use `@apply` with theme variables — use direct CSS with `@theme` declarations instead
- **Biome `useUniqueElementIds`:** Disabled — gives false positives for anchor navigation IDs
- **next.config.ts:** No top-level `await` — causes `ERR_REQUIRE_ASYNC_MODULE`
- **Bash `[locale]` paths:** Quote with single quotes to avoid zsh glob expansion
- **DB enums:** Use `landing_` prefix (e.g., `landing_intent`, `landing_locale`)

## Environment Variables

| Variable | Scope | Required |
|----------|-------|----------|
| `DATABASE_URL` | Server | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public | Yes |
| `NEXT_PUBLIC_PROJECT_NAME` | Public | No (default: "404 Tech Found") |
| `NEXT_PUBLIC_POSTHOG_KEY` | Public | No (Phase 5) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Public | No (Phase 5) |

## Adding New Code

- **New section component:** `apps/landing/src/app/[locale]/_components/{Section}.tsx` + translations in both `messages/es.json` and `messages/en.json`
- **New hook:** `apps/landing/src/hooks/use{Name}.ts`
- **New server action:** `apps/landing/src/app/[locale]/_actions/{feature}.actions.ts`
- **New DB table:** Add to `packages/database/src/schema.ts` → `bun run db:generate` → `bun run db:push`
- **New CSS variable:** Add to `:root` in `apps/landing/src/styles/globals.css`

## Nix Development Environment

The project uses a Nix flake (`flake.nix`) with direnv. After modifying `flake.nix`, run `direnv reload`.

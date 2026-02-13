# Codebase Structure

**Analysis Date:** 2026-02-13

## Directory Layout

```
404tf/
├── apps/                           # Multiple applications in monorepo
│   ├── landing/                    # Main Next.js 16 landing page (active)
│   │   ├── src/
│   │   │   ├── app/                # Next.js App Router
│   │   │   ├── i18n/               # Bilingual routing and navigation
│   │   │   ├── lib/                # Utilities, metadata, analytics
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── assets/             # Images (mascot.png, etc)
│   │   │   ├── styles/             # Global CSS and font loading
│   │   │   └── proxy.ts            # i18n middleware (Next.js 16 convention)
│   │   ├── public/                 # Static assets (favicons, etc)
│   │   ├── messages/               # i18n translation files (es.json, en.json)
│   │   ├── package.json            # App-specific dependencies
│   │   ├── next.config.ts          # Next.js config (transpile packages, image formats)
│   │   ├── tsconfig.json           # App-specific TypeScript config
│   │   ├── tailwind.config.ts      # Tailwind config (generated/deleted, uses postcss plugin)
│   │   ├── postcss.config.cjs      # PostCSS config for Tailwind v4
│   │   └── .next/                  # Build output (git-ignored)
│   │
│   └── spechack/                   # Secondary Next.js app (minimal)
│       ├── src/app/
│       ├── public/
│       ├── package.json
│       └── next.config.ts
│
├── packages/                       # Shared utilities and configuration
│   ├── database/                   # Drizzle ORM + Neon Postgres
│   │   ├── src/
│   │   │   ├── index.ts            # Drizzle client export
│   │   │   ├── schema.ts           # Table definitions (intentSubmissions)
│   │   │   └── env.ts              # Zod validation for DATABASE_URL
│   │   ├── drizzle.config.ts       # Drizzle kit config
│   │   └── package.json            # Exports: ".", "./schema", "./env"
│   │
│   └── config/                     # Shared TypeScript and linting config
│       ├── tsconfig.base.json      # Base TypeScript settings (extends by all apps)
│       ├── biome.jsonc             # Shared Biome linting rules
│       └── package.json            # Exports: "./tsconfig.base.json", "./biome.jsonc"
│
├── scripts/                        # Utility scripts (if any)
├── .planning/                      # GSD planning documents (this directory)
│   ├── codebase/                   # Architecture and code analysis docs
│   ├── phases/                     # Phase execution plans
│   └── research/                   # Research notes
│
├── node_modules/                   # Monorepo root dependencies
├── .direnv/                        # Direnv state (generated)
├── .lefthook/                      # Git hooks configuration
├── lefthook.yml                    # Lefthook config (linting on commit)
├── flake.nix                       # Nix devenv configuration
├── .envrc                          # Direnv setup for flake.nix
├── flake.lock                      # Nix lock file
│
├── package.json                    # Monorepo root (workspaces definition)
├── bun.lock                        # Bun lockfile (single source of truth for deps)
├── bunfig.toml                     # Bun runtime config
├── tsconfig.tsbuildinfo           # TypeScript incremental build state
├── knip.config.ts                 # Unused dependency detector config
│
├── .gitignore                      # Git ignore rules
├── .env                            # Environment variables (git-ignored, see .env.example)
├── .env.example                    # Example env vars (committed)
├── .env.local                      # Local overrides (git-ignored)
└── README.md                       # Project documentation
```

## Directory Purposes

**`apps/landing/src/app/`:**
- Purpose: Next.js App Router file structure
- Contains: Page components, layouts, route segments, special files (error.tsx, not-found.tsx, robots.ts, sitemap.ts)
- Key files:
  - `layout.tsx`: Root layout (HTML, fonts, providers)
  - `[locale]/layout.tsx`: Locale-specific layout with metadata generation
  - `[locale]/page.tsx`: Home page (section composition)
  - `[locale]/_components/`: Section components (Hero, Navbar, IntentCTA, etc)
  - `[locale]/_components/animations/`: Framer Motion animation wrappers
  - `[locale]/_actions/`: Server Actions for form handling
  - `[locale]/[...rest]/page.tsx`: Catch-all 404 route

**`apps/landing/src/i18n/`:**
- Purpose: Bilingual routing configuration and navigation helpers
- Contains:
  - `routing.ts`: Route config (locales: ["es", "en"], defaultLocale: "es", localePrefix: "always")
  - `navigation.ts`: Typed navigation helpers (Link, redirect, usePathname, useRouter)
  - `request.ts`: Request-scoped locale utilities (if used)

**`apps/landing/src/lib/`:**
- Purpose: Non-component logic and shared utilities
- Contains:
  - `utils.ts`: cn() function for class composition
  - `metadata/seo-config.ts`: Centralized site metadata (URL, name, email, social)
  - `metadata/json-ld/`: JSON-LD schema components (Organization, Event, FAQ)
  - `analytics/`: PostHog integration (provider, pageview tracking, web vitals)

**`apps/landing/src/hooks/`:**
- Purpose: Custom React hooks for client-side behavior
- Contains:
  - `useScrollDirection.ts`: Detects scroll direction (up/down) with debounce
  - `useBannerHeight.ts`: Tracks AnnouncementBanner height for sticky navbar offset
  - `useLocalStorage.ts`: LocalStorage persistence utility

**`apps/landing/src/assets/`:**
- Purpose: Static image and media files
- Contains: mascot.png (Tardi tardigrade image), any SVG or other media

**`apps/landing/src/styles/`:**
- Purpose: Global styling and font setup
- Contains:
  - `globals.css`: Tailwind v4 imports, @theme declarations, CSS variables, utility classes
  - `fonts.ts`: Google Fonts loader (Inter, Orbitron) with CSS variables

**`apps/landing/messages/`:**
- Purpose: Bilingual translation files
- Naming: `{locale}.json` (es.json, en.json)
- Structure: Nested JSON with namespaces (landing.hero, landing.nav, landing.intent, etc)
- Used by: `getTranslations()` server function at component render

**`packages/database/src/`:**
- Purpose: ORM layer and database schema
- Contains:
  - `index.ts`: Drizzle client initialization (connects to Neon Postgres)
  - `schema.ts`: Table definitions using Drizzle syntax (intentSubmissions table, enums)
  - `env.ts`: Zod validation for DATABASE_URL environment variable

**`packages/config/`:**
- Purpose: Shared configuration for all apps
- Exports: tsconfig.base.json (TypeScript), biome.jsonc (Linting)
- Used by: Each app extends tsconfig.json, biome.jsonc from this package

## Key File Locations

**Entry Points:**
- `apps/landing/src/app/layout.tsx`: Root layout, global CSS import, font setup, providers
- `apps/landing/src/app/[locale]/layout.tsx`: Locale layout, metadata generation
- `apps/landing/src/app/[locale]/page.tsx`: Home page, section composition
- `apps/landing/src/proxy.ts`: i18n middleware (Next.js 16 convention at src/ level, not inside app/)

**Configuration:**
- `apps/landing/next.config.ts`: Next.js config (transpile packages, image formats, i18n plugin)
- `apps/landing/tsconfig.json`: TypeScript config with path alias `@/*` → `./src/*`
- `apps/landing/postcss.config.cjs`: PostCSS for Tailwind v4 @tailwindcss/postcss plugin
- `packages/config/tsconfig.base.json`: Base TypeScript settings inherited by all apps
- `packages/database/drizzle.config.ts`: Drizzle kit config (schema location, migrations)
- `package.json` (root): Monorepo workspaces, scripts for build/dev/lint

**Core Logic:**
- `apps/landing/src/lib/metadata/seo-config.ts`: Single source of truth for site metadata
- `apps/landing/src/app/[locale]/_actions/intent.actions.ts`: Form submission handler with Zod validation
- `packages/database/src/schema.ts`: Database table definitions (intentSubmissions)
- `apps/landing/src/i18n/routing.ts`: Locale configuration

**Testing:**
- Not detected; testing framework not configured yet

## Naming Conventions

**Files:**

| Pattern | Example | Usage |
|---------|---------|-------|
| `camelCase.ts` | `seo-config.ts`, `useScrollDirection.ts` | Utilities, hooks, config files |
| `PascalCase.tsx` | `Hero.tsx`, `IntentCTA.tsx` | React components |
| `kebab-case.json` | `es.json`, `en.json` | i18n message files |
| `layout.tsx` | `layout.tsx` | Next.js layout files |
| `page.tsx` | `page.tsx` | Next.js page files |
| `[param].tsx` | `[locale].tsx`, `[...rest].tsx` | Dynamic route segments |
| `.actions.ts` | `intent.actions.ts` | Server Actions (form handlers) |
| `_components/` | `_components/` | Private component directory (underscore prefix for Next.js) |

**Directories:**

| Pattern | Example | Purpose |
|---------|---------|---------|
| `[locale]` | `/es`, `/en` | Dynamic locale segment |
| `_components` | `_components/` | Private components (prefixed underscore) |
| `_actions` | `_actions/` | Private Server Actions |
| `json-ld` | `metadata/json-ld/` | Schema components grouped by type |

**Components:**

- Export as named function: `export function ComponentName() {}`
- Filename matches PascalCase: `ComponentName.tsx`
- Accept typed props: `type ComponentNameProps = { ... }`
- Prefix with "use" for hooks: `useScrollDirection`, `useBannerHeight`

**TypeScript Types:**

- Component props: `type {ComponentName}Props = { ... }`
- Form state: `type FormState = { success: boolean; ... }`
- Enums: Defined in Drizzle schema (landing_intent, landing_locale) with prefix `landing_`

## Where to Add New Code

**New Feature/Section:**
- **Component file**: `apps/landing/src/app/[locale]/_components/{SectionName}.tsx`
- **If interactive**: Add `"use client"` directive at top
- **Translations**: Add namespace to `messages/es.json` and `messages/en.json` (e.g., "landing.{sectionName}")
- **If form submission**: Add Server Action in `apps/landing/src/app/[locale]/_actions/{feature}.actions.ts`
- **Database change**: Update schema in `packages/database/src/schema.ts`, run `bun run db:generate && bun run db:push`

**New Utility/Hook:**
- **Reusable hook**: `apps/landing/src/hooks/use{HookName}.ts`
- **Shared utility**: `apps/landing/src/lib/utils/` (create if doesn't exist)
- **Metadata utility**: `apps/landing/src/lib/metadata/{feature}.ts`
- **Analytics utility**: `apps/landing/src/lib/analytics/{feature}.tsx`

**Styling:**
- **Global styles**: Add to `apps/landing/src/styles/globals.css`
- **Utility classes**: Define in globals.css under `@layer utilities`
- **Component styles**: Use inline Tailwind classes (no CSS modules currently)
- **CSS variables**: Add to `:root` in globals.css (e.g., `--house-ai: hsl(...)`)

**Configuration:**
- **Shared TypeScript**: `packages/config/tsconfig.base.json` (extends to all apps)
- **Shared linting**: `packages/config/biome.jsonc` (all apps inherit)
- **i18n routes**: Modify `apps/landing/src/i18n/routing.ts` (add locale, change prefix)

**New Database Table:**
1. Add table definition to `packages/database/src/schema.ts`
2. Export type: `export type NewTable = typeof tableName.$inferInsert`
3. Run: `bun run db:generate` (creates migration)
4. Run: `bun run db:push` (applies to Neon)
5. Import in Server Actions: `import { tableName } from "@404tf/database/schema"`
6. Insert data: `await db.insert(tableName).values(...)`

## Special Directories

**`.planning/`:**
- Purpose: GSD workflow planning and analysis
- Generated: Yes (by GSD commands)
- Committed: Yes
- Contains: Phase plans, research, codebase analysis docs

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (during `bun run build`)
- Committed: No (git-ignored)
- Contains: .js chunks, server functions, static exports

**`node_modules/`:**
- Purpose: Bun workspace dependencies (monorepo root installs all)
- Generated: Yes (bun install)
- Committed: No (git-ignored)

**`messages/`:**
- Purpose: i18n translation files
- Generated: No (manually maintained)
- Committed: Yes
- Format: Flat JSON with dot-notation namespaces (landing.hero.headline)

**`public/`:**
- Purpose: Static assets served at root (favicons, robots.txt, etc)
- Generated: No (manually added)
- Committed: Yes
- Next.js serves these without processing

**`.direnv/`:**
- Purpose: Direnv state for flake.nix dev environment
- Generated: Yes (direnv reload)
- Committed: No (git-ignored)

## Development Workflow Paths

**Start development:**
```bash
bun install
direnv reload            # Load flake.nix dev environment
bun run dev              # Start landing app with --turbopack
```

**Add a new section:**
1. Create component: `apps/landing/src/app/[locale]/_components/{Section}.tsx`
2. Add translations: Update `messages/es.json`, `messages/en.json`
3. Import in `apps/landing/src/app/[locale]/page.tsx`
4. Wrap with `<FadeInSection>` if animation desired

**Handle form submission:**
1. Create Server Action: `apps/landing/src/app/[locale]/_actions/{feature}.actions.ts`
2. Export FormState type and action function
3. Use in component: `const [state, formAction] = useActionState<FormState, FormData>(actionName, null)`
4. Access results in component via state object

**Deploy:**
1. Database schema: `bun run db:push` (applies pending migrations)
2. Build: `bun run build` (Next.js build --turbopack)
3. Start: `bun run start` (production server)
4. CI/CD platform will auto-detect monorepo and deploy apps independently

---

*Structure analysis: 2026-02-13*

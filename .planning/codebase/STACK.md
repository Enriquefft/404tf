# Technology Stack

**Analysis Date:** 2026-02-13

## Languages

**Primary:**
- TypeScript (latest) - All application and package source code
- JavaScript (ECMAScript modules) - Configuration files and utility scripts

## Runtime

**Environment:**
- Node.js v24.13.0 - Development and build environments
- Bun 1.3.8 - Package manager and runtime (configured via `packageManager: bun@1.x` in `/home/hybridz/Projects/404tf/package.json`)

**Package Manager:**
- Bun 1.x (monorepo workspaces)
- Lockfile: `bun.lock` (present)
- Configuration: `bunfig.toml` at root (minimal test timeout configuration)

## Frameworks

**Core:**
- Next.js (latest) - Full-stack framework with React 19 support
  - Apps: `/home/hybridz/Projects/404tf/apps/landing`, `/home/hybridz/Projects/404tf/apps/spechack`
  - Build with Turbopack: `next dev --turbopack`
  - Configured at `/home/hybridz/Projects/404tf/apps/landing/next.config.ts`

**Internationalization:**
- next-intl (latest) - Bilingual support (ES/EN)
  - Configuration: `src/proxy.ts` at `/home/hybridz/Projects/404tf/apps/landing/src/proxy.ts` (Next.js 16 convention)
  - Routing config: `/home/hybridz/Projects/404tf/apps/landing/src/i18n/routing.ts`

**Styling:**
- Tailwind CSS ~4.0.0 - Pinned to v4.0.x (v4.1.18 has Turbopack incompatibility)
- PostCSS (latest) - CSS transformation pipeline
- @tailwindcss/postcss (latest) - Tailwind v4 PostCSS plugin
- tailwind-merge (latest) - Merge Tailwind classes safely
- clsx (latest) - Conditional class concatenation

**UI Components:**
- shadcn/ui pattern - Component library with Tailwind styling (stubs in `/home/hybridz/Projects/404tf/apps/landing/src/components/ui/`)
- lucide-react (^0.563.0) - Icon library
- hamburger-react (^2.5.2) - Mobile menu toggle component
- framer-motion (^12.34.0) - Animation library

**Analytics:**
- posthog-js (^1.347.0) - Product analytics (optional, Phase 5)
  - Provider: `/home/hybridz/Projects/404tf/apps/landing/src/lib/analytics/posthog-provider.tsx`
  - Page view tracking: `/home/hybridz/Projects/404tf/apps/landing/src/lib/analytics/posthog-pageview.tsx`
  - Web Vitals: `/home/hybridz/Projects/404tf/apps/landing/src/lib/analytics/web-vitals.tsx`

**Data Layer:**
- react-countup (^6.5.3) - Animated number counter component
- react-intersection-observer (^10.0.2) - Detect element visibility in viewport

**Database ORM:**
- Drizzle ORM (latest) - Type-safe database access layer
  - Package: `@404tf/database` at `/home/hybridz/Projects/404tf/packages/database/`
  - Exports: schema, client, environment configuration
  - Client: `drizzle-orm/neon-serverless` for Neon Postgres

**Validation:**
- zod (latest) - TypeScript-first schema validation
  - Used in: environment validation (`@t3-oss/env-nextjs`), database schema types

## Testing & Development

**Linting & Formatting:**
- Biome (latest) - Unified linter, formatter, and bundler alternative
  - Configuration: `/home/hybridz/Projects/404tf/packages/config/biome.jsonc`
  - Format: tabs, double quotes, 100 char line width
  - Domains: Next.js and React
  - Disabled rule: `useUniqueElementIds` (gives false positives for anchor navigation)
  - Command: `bun run lint` (checks and fixes)

**Unused Dependency Detection:**
- knip (latest) - Find unused dependencies
  - Configuration: `/home/hybridz/Projects/404tf/knip.config.ts`
  - Workspace entries configured for all apps and packages

**Pre-commit Hooks:**
- lefthook (git hook framework)
  - Configuration: `/home/hybridz/Projects/404tf/lefthook.yml`
  - commitlint-rs (commit message linting)

**Deployment:**
- Vercel (Next.js hosting)
  - Configuration: `vercel.json` in landing app

## Key Dependencies

**Critical:**
- @404tf/database (workspace) - Shared database layer with Drizzle ORM
- @404tf/config (workspace) - Shared TypeScript and Biome configuration
- @t3-oss/env-nextjs (latest) - Environment variable validation with Zod
- @neondatabase/serverless (latest) - Neon serverless Postgres client

**Infrastructure:**
- dotenv (^17.2.4) - Load `.env` files for database package configuration
- drizzle-kit (latest) - CLI for database migrations and schema management

**Development Only:**
- @types/node (latest) - Node.js type definitions
- @types/react (latest) - React type definitions
- @types/react-dom (latest) - React DOM type definitions

## Configuration Files

**TypeScript:**
- Base: `/home/hybridz/Projects/404tf/packages/config/tsconfig.base.json`
  - Target: ESNext, module: ESNext, strict: true, noEmit: true
  - Path aliases resolved via `moduleResolution: bundler`
- Landing app: `/home/hybridz/Projects/404tf/apps/landing/tsconfig.json`
  - Extends base config
  - Path alias: `@/*` → `./src/*`
  - Plugins: Next.js (for experimental features)

**Biome:**
- `/home/hybridz/Projects/404tf/packages/config/biome.jsonc` (single source of truth)
  - Linter: Next.js and React all rules enabled
  - Formatter: tabs, double quotes, 100 char width
  - CSS modules and Tailwind directives enabled
  - Git VCS integration enabled

**PostCSS:**
- `/home/hybridz/Projects/404tf/apps/landing/postcss.config.cjs` - Tailwind CSS plugin setup

**Next.js:**
- `/home/hybridz/Projects/404tf/apps/landing/next.config.ts`
  - Transpile packages: @404tf/database, @404tf/config, @t3-oss/env packages
  - Image formats: AVIF, WebP
  - next-intl plugin configured

**Monorepo Workspace:**
- `/home/hybridz/Projects/404tf/package.json` - Root workspace configuration
  - Workspaces: `apps/*`, `packages/*`
  - Bun 1.x package manager enforced

## Environment Configuration

**Required variables:** (from `/home/hybridz/Projects/404tf/.env.example`)
- `DATABASE_URL` - Neon PostgreSQL connection string (server-side only)
- `NEXT_PUBLIC_SITE_URL` - Site base URL (public)
- `NEXT_PUBLIC_PROJECT_NAME` - Display name (public, default: "404 Tech Found")
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key (optional, Phase 5)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog API endpoint (optional, Phase 5)

**Secrets location:**
- `.env` (root) - Contains DATABASE_URL and other secrets
- `.env.local` (root) - Local overrides, git-ignored
- Not committed: `.env*` files (see `.gitignore`)

**Database validation:**
- Implemented in `/home/hybridz/Projects/404tf/packages/database/src/env.ts`
- PostgreSQL URL schema validation: must start with `postgresql://`, include credentials and hostname
- Fallback error messages for malformed URLs

## Platform Requirements

**Development:**
- Node.js v24+ (runtime compatibility)
- Bun 1.3.8+ (package manager and test runner)
- macOS/Linux/Windows (Nix flake available for Linux development)
- Playwright host requirements (optionally skipped on NixOS via `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS`)

**Production:**
- Vercel (Next.js hosting platform)
- Neon Postgres (serverless database)
- Next.js 16+ compatible browser environments

**Development Environment (Nix):**
- File: `/home/hybridz/Projects/404tf/flake.nix`
- Provides: bun, nodejs, direnv, coreutils, commitlint-rs, vercel CLI
- Activation: `direnv reload` (after flake updates)

---

*Stack analysis: 2026-02-13*

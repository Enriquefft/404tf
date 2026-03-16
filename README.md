# 404 Tech Found

Bun workspace monorepo for 404 Tech Found digital products.

## Structure

```
404tf/
├── apps/
│   ├── landing/          # 404tf.com landing page (Next.js 16)
│   └── map/              # LATAM Deeptech Map (Astro)
├── packages/
│   ├── brand/            # Brand tokens, logos, fonts, export scripts (@404tf/brand)
│   ├── config/           # Shared TypeScript, Biome, Tailwind configs
│   └── database/         # Shared Drizzle ORM + Neon Postgres schemas
└── package.json          # Workspace root
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.x or later
- [Nix](https://nixos.org) (optional, for dev environment)

### Installation

```bash
# Install all workspace dependencies
bun install

# Start landing page in dev mode
bun run dev

# Start map app in dev mode
bun run dev:map
```

### Development

Each app runs independently:

```bash
# Landing page (localhost:3000)
cd apps/landing
bun run dev

# LATAM Deeptech Map (localhost:4321)
cd apps/map
bun run dev
```

### Building

```bash
# Build all apps
bun run build

# Build specific app
bun run build:landing
bun run build:map
```

## Apps

### Landing Page (apps/landing/)

404tf.com landing page - bilingual (ES/EN) Next.js 16 site with:
- next-intl for i18n routing
- Tailwind v4 for styling
- Framer Motion for animations
- Drizzle ORM + Neon Postgres

**Live:** [404tf.com](https://404tf.com)

### LATAM Deeptech Map (apps/map/)

Static data story of the LATAM deeptech ecosystem, built with Astro.

**Live:** [map.404tf.com](https://map.404tf.com)

## Packages

### @404tf/brand

Single source of truth for 404tf brand identity:
- Color tokens (OKLCH + hex)
- Logo config and export pipeline
- Font declarations
- Team content and photos

### @404tf/config

Shared configuration for all apps:
- `tsconfig.base.json` - Base TypeScript config
- `biome.jsonc` - Biome linting/formatting rules

### @404tf/database

Shared database layer:
- Drizzle ORM schemas
- Neon Postgres connection
- Environment variable validation

## Database Commands

```bash
# Generate migrations
bun run db:generate

# Push schema to database
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

## Brand Commands

```bash
# Generate PNG/SVG wordmarks
bun run logo:export

# Copy brand assets to app public/ dirs
bun run brand:sync
```

## Linting

```bash
# Fix all linting issues
bun run lint

# Check without fixing
bun run check

# Check for unused dependencies
bun run check:deps
```

## Deployment

Apps deploy independently on Vercel:
- **Landing:** Root Directory = `apps/landing`
- **Map:** Root Directory = `apps/map`

## Tech Stack

- **Runtime:** Bun 1.x
- **Framework:** Next.js 16 (landing), Astro (map)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Neon Postgres + Drizzle ORM
- **Linting:** Biome
- **Package Manager:** Bun workspaces

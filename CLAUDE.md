# 404 Tech Found

## Monorepo Layout

```
apps/landing/      # Next.js 16 landing (active)
apps/map/          # Astro 5 LATAM deeptech directory
packages/brand/    # @404tf/brand — tokens, logos, fonts
packages/database/ # Drizzle + Neon (shared)
packages/config/   # Shared tsconfig + biome.jsonc
```

- Runtime: Bun. Lint: Biome (shared `packages/config/biome.jsonc`).
- Drizzle schema lives in `packages/database/`; apps import, never redefine.

# 404 Tech Found

## Monorepo Layout

```
apps/landing/          # Main landing page (Next.js 16, active development)
apps/map/              # LATAM Deeptech Map (Astro, static data story)
packages/brand/        # Brand tokens, logo config, fonts, export scripts (@404tf/brand)
packages/database/     # Drizzle ORM + Neon (shared)
packages/config/       # Shared tsconfig + biome.jsonc
```

## Quality Bar

- Robust, long-term correct, scalable implementations only.
- Single source of truth, always.
- Zero workarounds, bandaids, hacks, or "fix later" TODOs.
- Production and enterprise ready is the floor, not the ceiling.
- If something is hard to do right, do it right anyway.

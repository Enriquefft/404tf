# 404 Mapped — TODO

## Done (2026-03-24)

### House colors synced to Foundry brand

Updated `src/styles/globals.css` vertical colors to match the new Foundry brand tokens (`packages/brand/src/tokens.ts`):

| Vertical | Old | New | Note |
|----------|-----|-----|------|
| `--v-ai` | `#ff66b3` | `#ff2898` | More saturated pink |
| `--v-biotech` | `#00bd68` | `#00cd4e` | Brighter green |
| `--v-hardware` | `#ffb300` | `#ff4834` | **Hue changed**: amber → vermillion (matches Foundry's forge metaphor) |
| `--v-space` | — | `#00a0f0` | **New**: 4th house added |

### Not changed (intentionally different from landing)

- **Primary purple** `#7C3AED` — cooler/institutional vs Foundry's warmer `#8E2CD7`. Intentional editorial counterpoint.
- **Typography** — Bricolage Grotesque / Space Grotesk / Plus Jakarta Sans. Map is editorial, landing is industrial.
- **Radius** — 0.5rem (map) vs 0rem (landing). Map is softer, landing is brutalist.
- **Backgrounds** — `#0A0710` ≈ Foundry's `#0F080F`. Already aligned (deep plum).

### design-spec.jsonc updated

All old house hex values replaced: `#FF66B3` → `#FF2898`, `#00BD68` → `#00CD4E`, `#FFB300` → `#FF4834`. Landing comparison table updated with Foundry fonts + Space house. No old values remain.

### Tailwind theme bindings added

Added all 13 vertical colors to `@theme inline` block in `globals.css` (`--color-v-ai`, `--color-v-space`, etc.) so they work as Tailwind utilities like `bg-v-ai`, `text-v-space`.

### Source verification

Grep confirmed zero hardcoded old house hex values in `src/`.

## Pending

- [ ] Add Space vertical to category system (if applicable to map's data model)

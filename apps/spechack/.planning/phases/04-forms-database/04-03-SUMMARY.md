---
phase: 04-forms-database
plan: 03
subsystem: seo-metadata
tags: [seo, metadata, i18n, opengraph, twitter-card]
dependency-graph:
  requires: ["04-01"]
  provides: ["generateMetadata", "seo-config", "metadata-translations"]
  affects: ["layout.tsx", "messages/es.json", "messages/en.json"]
tech-stack:
  added: []
  patterns: ["generateMetadata async function", "locale-aware OG metadata", "seo-config constants"]
key-files:
  created:
    - apps/spechack/src/lib/metadata/seo-config.ts
  modified:
    - apps/spechack/src/app/[locale]/layout.tsx
    - apps/spechack/messages/es.json
    - apps/spechack/messages/en.json
decisions:
  - summary: "Reference /og-spechack.png in metadata without creating file"
    rationale: "Phase 6 will implement dynamic OG images; placeholder path is acceptable for dev"
  - summary: "Follow landing app generateMetadata pattern exactly"
    rationale: "Consistent patterns across monorepo apps"
metrics:
  duration: "1.4m"
  completed: "2026-02-14T06:29:28Z"
---

# Phase 4 Plan 3: SEO Metadata & Translations Summary

Locale-aware generateMetadata function with OG/Twitter card support, backed by translation namespaces and centralized SEO config constants.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| e4e2235 | feat | Add metadata translations and SEO config |
| bb724f3 | feat | Replace static metadata with generateMetadata in layout |

## What Was Done

### Task 1: Metadata Translations + SEO Config
- Added `metadata` namespace to both `messages/es.json` and `messages/en.json` with `title`, `description`, and `ogImageAlt` keys
- Created `src/lib/metadata/seo-config.ts` with `SITE_URL` (env-backed with fallback) and `SITE_NAME` constants
- Follows landing app's seo-config.ts pattern (minimal, no social links needed for SpecHack)

### Task 2: generateMetadata in layout.tsx
- Removed static `export const metadata` object
- Added async `generateMetadata` function with locale-aware:
  - Title template (`%s | SpecHack 2026`)
  - Description from translations
  - Canonical URL and language alternates (`/es`, `/en`)
  - OpenGraph metadata (title, description, siteName, locale, image)
  - Twitter card (summary_large_image)
  - Robots directives (index, follow, googleBot)
- Added `getTranslations` import alongside existing `getMessages`
- Added `SITE_NAME`, `SITE_URL` imports from seo-config
- Preserved existing `generateStaticParams`, `LocaleLayout`, and `NextIntlClientProvider`

### Task 3: Human Verification (checkpoint)
- Not executed -- checkpoint task for verifying forms + metadata in dev environment
- Forms verification depends on Plan 04-02 completion

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- Both JSON files are valid JSON (verified with Node.js parser)
- Biome check passes on all modified files
- `bun run build` compiles successfully with no errors
- layout.tsx exports `generateMetadata` (not static metadata)
- layout.tsx imports `SITE_NAME`, `SITE_URL` from `@/lib/metadata/seo-config`

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/metadata/seo-config.ts` | SITE_URL and SITE_NAME constants |
| `src/app/[locale]/layout.tsx` | generateMetadata with locale-aware OG metadata |
| `messages/es.json` | Spanish metadata namespace |
| `messages/en.json` | English metadata namespace |

## Notes

- OG image path `/og-spechack.png` is referenced but file does not exist yet -- Phase 6 will create dynamic OG images
- The `getMessages()` call remains in `LocaleLayout` for `NextIntlClientProvider` -- `getTranslations` is used separately in `generateMetadata` for namespace-scoped access

## Self-Check: PASSED

- FOUND: apps/spechack/src/lib/metadata/seo-config.ts
- FOUND: apps/spechack/src/app/[locale]/layout.tsx
- FOUND: apps/spechack/messages/es.json
- FOUND: apps/spechack/messages/en.json
- FOUND: commit e4e2235 (metadata translations + seo config)
- FOUND: commit bb724f3 (generateMetadata in layout)

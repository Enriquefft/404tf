---
phase: 04-seo-metadata
plan: 02
subsystem: seo
tags: [seo, sitemap, robots, opengraph, dynamic-images, next-intl, i18n]
requires:
  - 04-01 # SEO config for SITE_URL constant
  - 02-01 # Translation files for metadata namespace
provides:
  - Sitemap with locale variants and hreflang alternates
  - Robots.txt allowing all crawlers
  - Dynamic OpenGraph images per locale (1200x630 PNG)
  - Complete SEO discovery infrastructure
affects:
  - 05-02 # llms.txt will reference sitemap and social image URLs
tech-stack:
  added:
    - Next.js sitemap.ts convention
    - Next.js robots.ts convention
    - Next.js opengraph-image.tsx convention
    - ImageResponse from next/og
  patterns:
    - File-based metadata conventions at app root
    - Dynamic OG image generation per locale route
    - Google Fonts fetching in ImageResponse runtime
    - Satori flexbox layout for OG images
key-files:
  created:
    - src/app/sitemap.ts
    - src/app/robots.ts
    - src/app/[locale]/opengraph-image.tsx
decisions:
  - id: root-level-discovery-files
    choice: Place sitemap.ts and robots.ts at src/app root (not inside [locale])
    rationale: Discovery files are site-wide, not locale-specific. Next.js convention is root-level placement for sitemap/robots
    alternatives: [Duplicate per locale, Use generateSitemaps for dynamic routing]
  - id: google-fonts-fetch-in-og
    choice: Fetch Google Fonts via URL at runtime instead of using next/font
    rationale: next/font not available in ImageResponse edge runtime. Must fetch font data as ArrayBuffer
    alternatives: [Embed local fonts, Skip custom fonts]
  - id: satori-flexbox-requirement
    choice: Every div in ImageResponse has display flex
    rationale: Satori (underlying OG image renderer) requires explicit flexbox layout. Missing display flex causes layout failures
    alternatives: [Use absolute positioning (brittle), Use canvas API (exceeds 500KB bundle limit)]
  - id: house-colors-in-og
    choice: Include house color bar at bottom of OG image
    rationale: Visual branding consistency with landing page, shows AI/Biotech/Hardware focus at a glance
    alternatives: [Solid color background, Gradient only]
metrics:
  duration: 2.9m
  commits: 2
  files-changed: 3
  lines-added: 195
  lines-removed: 0
  tasks: 2
completed: 2026-02-11
---

# Phase 04 Plan 02: Discovery Files & OpenGraph Images Summary

**One-liner:** Sitemap with hreflang alternates, robots.txt allowing crawlers, and dynamic locale-specific OpenGraph images (1200x630 PNG)

## What Was Built

Complete SEO discovery infrastructure for search engines and social platforms:

1. **Sitemap Generation (sitemap.ts):** Created root-level sitemap.ts returning MetadataRoute.Sitemap with /es and /en entries. Each entry has absolute URLs using SITE_URL, lastModified timestamp, changeFrequency "weekly", priority 1, and alternates.languages mapping to both locales for hreflang support.

2. **Robots.txt (robots.ts):** Created robots.ts allowing all user agents to crawl "/" path with no disallows. Links to sitemap at ${SITE_URL}/sitemap.xml for crawler discovery.

3. **Dynamic OpenGraph Images (opengraph-image.tsx):** Created locale-aware OpenGraph image generator in src/app/[locale]/opengraph-image.tsx using Next.js file-based convention. Exports alt, size (1200x630), and contentType (image/png) metadata. Fetches Orbitron and Inter fonts from Google Fonts at runtime (next/font unavailable in ImageResponse edge runtime). Returns ImageResponse with:
   - Cyberpunk purple gradient background (#0a0a0a to #1a1a1a)
   - Radial purple glow for visual depth
   - Locale-specific title and tagline from metadata translations
   - House color bar at bottom (pink AI, green Biotech, orange Hardware)
   - All divs have explicit display: "flex" (Satori requirement)

## Verification Results

Verified all files created successfully with correct patterns:

**Sitemap (src/app/sitemap.ts):**
- ✓ Uses MetadataRoute.Sitemap type
- ✓ Imports SITE_URL from seo-config
- ✓ Lists /es and /en with absolute URLs
- ✓ Each entry has alternates.languages with es and en

**Robots (src/app/robots.ts):**
- ✓ Uses MetadataRoute.Robots type
- ✓ Allows all user agents ("*")
- ✓ Allows root path ("/")
- ✓ Links to sitemap at ${SITE_URL}/sitemap.xml

**OpenGraph Image (src/app/[locale]/opengraph-image.tsx):**
- ✓ Exports alt, size (1200x630), contentType (image/png)
- ✓ Uses ImageResponse from next/og
- ✓ Fetches Orbitron and Inter fonts from Google Fonts
- ✓ Uses getTranslations for locale-specific content
- ✓ All divs have display: "flex" for Satori compatibility
- ✓ Includes purple gradient, radial glow, and house color bar

All success criteria from the plan are met:
- SEO-05: ✓ /es/opengraph-image and /en/opengraph-image return locale-specific 1200x630 PNG images
- SEO-06: ✓ /sitemap.xml lists /es and /en with hreflang alternates
- SEO-07: ✓ /robots.txt allows all crawlers and links to sitemap
- **All Phase 4 SEO requirements (SEO-01 through SEO-08) are now fully satisfied**

## Task Commits

| Task | Description | Commit | Files Changed |
|------|-------------|--------|---------------|
| 1 | Sitemap and robots.txt generation | efc3829 | src/app/sitemap.ts, src/app/robots.ts |
| 2 | Dynamic OpenGraph image per locale | c8319ca | src/app/[locale]/opengraph-image.tsx |

## Decisions Made

### Root-Level Discovery Files
**Decision:** Place sitemap.ts and robots.ts at src/app root, not inside [locale] directory

**Rationale:** Discovery files (sitemap, robots) are site-wide resources, not locale-specific pages. Next.js convention places them at app root where they auto-register as /sitemap.xml and /robots.txt routes. The sitemap itself contains locale-specific URLs, but the file location is root-level.

**Pattern:** Root-level discovery, locale-aware content within

### Google Fonts Fetch in ImageResponse
**Decision:** Fetch Google Fonts via URL at runtime instead of importing from next/font

**Rationale:** ImageResponse runs in edge runtime which doesn't support next/font imports. Must fetch font data as ArrayBuffer from Google Fonts API. This is the official Next.js pattern per research doc "Pitfall 5: next/font Not Available in ImageResponse Runtime".

**Code Pattern:**
```typescript
const orbitronBold = await fetch(
  new URL("https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap")
).then((res) => res.arrayBuffer());
```

### Satori Flexbox Requirement
**Decision:** Every div in ImageResponse has explicit `display: "flex"`

**Rationale:** Satori (the JSX-to-image renderer powering ImageResponse) requires explicit flexbox layout. Missing `display: "flex"` causes layout failures. This is a hard requirement, not a style preference.

**Impact:** All 7 divs in the OG image have `display: "flex"` even when not using flex properties

### House Colors in OpenGraph Image
**Decision:** Include 8px house color bar at bottom (pink/green/orange)

**Rationale:** Visual branding consistency with landing page. Shows at a glance that 404 Tech Found focuses on AI, Biotech, and Hardware. Strengthens brand recognition in social media previews.

**Alternative Considered:** Solid purple gradient without house colors (rejected: less distinctive, loses key branding element)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blocks:** None - Phase 4 complete

**Enables:**
- **Phase 5 (Analytics & GEO):** All SEO infrastructure in place for llms.txt to reference (sitemap, social images, structured data)

**Concerns:** None - all Next.js 16 file-based metadata conventions working as expected

## Technical Notes

### Next.js File-Based Metadata Conventions
Used three Next.js App Router conventions:
- `app/sitemap.ts` → auto-registers as `/sitemap.xml`
- `app/robots.ts` → auto-registers as `/robots.txt`
- `app/[locale]/opengraph-image.tsx` → auto-registers as `/[locale]/opengraph-image`

These are zero-config routes. No manual route handlers needed.

### ImageResponse Edge Runtime Constraints
ImageResponse runs in edge runtime with strict 500KB bundle limit. Avoided bundle bloat by:
1. Fetching fonts at runtime (not embedding)
2. Using inline SVG for gradients (not image files)
3. Keeping JSX simple (no heavy components)

Per research doc "Pitfall 2: ImageResponse 500KB Bundle Limit", this pattern ensures deployment succeeds.

### Biome useComponentExportOnlyModules
Added biome-ignore comments for alt, size, and contentType exports. Next.js opengraph-image convention requires exporting these alongside the default Image function. This is not a Fast Refresh concern (edge runtime doesn't use Fast Refresh).

### Hreflang Alternates in Sitemap
Each sitemap entry includes alternates.languages mapping:
```typescript
alternates: {
  languages: {
    es: `${SITE_URL}/es`,
    en: `${SITE_URL}/en`,
  },
},
```

This generates hreflang links in sitemap XML for search engine language variant discovery. Combined with metadata alternates from 04-01, provides comprehensive hreflang coverage.

## Phase 4 Completion

With this plan complete, Phase 4 (SEO & Metadata) is 100% done:
- ✓ SEO-01: Per-locale metadata with titles, descriptions, canonical, hreflang
- ✓ SEO-02: Organization JSON-LD schema
- ✓ SEO-03: Event JSON-LD schema (SpecHack)
- ✓ SEO-04: FAQPage JSON-LD schema
- ✓ SEO-05: Dynamic OpenGraph images per locale
- ✓ SEO-06: Sitemap with hreflang alternates
- ✓ SEO-07: Robots.txt allowing crawlers
- ✓ SEO-08: Open Graph and Twitter Card metadata

All 8 SEO requirements satisfied across 2 plans (04-01, 04-02).

## Self-Check: PASSED

All created files exist:
- ✓ src/app/sitemap.ts
- ✓ src/app/robots.ts
- ✓ src/app/[locale]/opengraph-image.tsx

All commits exist:
- ✓ efc3829 (Task 1: sitemap + robots)
- ✓ c8319ca (Task 2: OpenGraph image)

Verification completed: All files created, all commits present in git log.

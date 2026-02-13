# Domain Pitfalls: Vite/React SPA → Next.js 16 App Router Migration

**Domain:** Vite/React SPA to Next.js 16 App Router migration
**Researched:** 2026-02-13
**Confidence:** HIGH (verified with official Next.js docs + 2026 community reports)

## Critical Pitfalls

Mistakes that cause rewrites, major refactors, or production failures.

### Pitfall 1: Client Component Cascade (The "use client" Pandemic)

**What goes wrong:** Developers mark every component with "use client" because they're used to React, causing the entire component tree to become client-side. This sends unnecessary JavaScript to the browser and eliminates Next.js SSR performance benefits.

**Why it happens:**
- React Router SPAs are 100% client-side, so developers default to that mental model
- Error messages like "useState only works in Client Components" trigger knee-jerk "use client" additions
- Lack of understanding of Server Component benefits

**Consequences:**
- Browser has to hydrate everything → more JavaScript, more parsing, slower initial load
- Loss of automatic code splitting benefits
- Network waterfalls return (the problem you migrated to escape)
- Performance metrics regress below SPA baseline

**Prevention:**
1. **Default to Server Components** — Only add "use client" when you need:
   - Browser-only APIs (window, localStorage, Canvas API)
   - React hooks (useState, useEffect, useContext)
   - Event handlers (onClick, onChange)
2. **Create wrapper components** — Wrap interactive parts in small Client Components, keep container as Server Component
3. **Prop-drill interactive callbacks** — Pass event handlers from Client Component parents to Server Component children
4. **Measure bundle size** — Use `@next/bundle-analyzer` to catch client-side bloat early

**Detection:**
- Build output shows large client bundle sizes
- DevTools show unnecessary hydration
- Page Speed Insights reports high JavaScript execution time
- Most components have "use client" directive

**Phase impact:** Foundation phase must establish this pattern. Wrong choice cascades through entire codebase.

**Sources:**
- [Next.js App Router Performance Optimization](https://medium.com/@shirkeharshal210/next-js-performance-optimization-app-router-a-practical-guide-a24d6b3f5db2)
- [Common App Router Mistakes](https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/)
- [App Router Pitfalls](https://imidef.com/en/2026-02-11-app-router-pitfalls)

---

### Pitfall 2: Framer Motion in Every Component

**What goes wrong:** Importing `motion.div` directly in Server Components causes "Error: motion.div is not defined" or runtime hydration errors. Developers then mark every animated component with "use client", creating Component Cascade (Pitfall #1).

**Why it happens:**
- Framer Motion requires DOM access and browser APIs
- Documentation examples don't emphasize Server Component boundaries
- Developers copy-paste Vite/React animation code directly

**Consequences:**
- Entire page trees become client-side
- Animation-heavy apps lose all SSR benefits
- Bundle size bloats (Framer Motion is ~50KB)
- Hydration mismatches cause layout shifts

**Prevention:**
1. **Create motion wrapper components once** — In `src/components/motion.tsx`:
   ```tsx
   "use client"

   import { motion } from "framer-motion"

   export const MotionDiv = motion.div
   export const MotionSection = motion.section
   export const MotionP = motion.p
   // etc.
   ```
2. **Import wrappers, not motion directly** — All other files import from `@/components/motion`
3. **Keep animation config in Server Components** — Pass `variants` as props from Server to Client wrapper
4. **Minimize "use client" surface area** — Only the animated wrapper is client-side, parent can stay server-side

**Detection:**
- Build errors mentioning "motion" in Server Components
- Hydration warnings about animation properties
- Every component file has "use client" and imports `framer-motion`
- Lighthouse scores drop vs Vite baseline

**Phase impact:** Interactive Components phase. Set up motion wrappers BEFORE migrating first animation.

**Sources:**
- [Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)
- [Resolving Framer Motion Compatibility](https://medium.com/@dolce-emmy/resolving-framer-motion-compatibility-in-next-js-14-the-use-client-workaround-1ec82e5a0c75)
- [Framer Motion Next.js Optimization Issue](https://github.com/framer/motion/issues/2206)

---

### Pitfall 3: Canvas API Hydration Mismatch

**What goes wrong:** Canvas rendering code runs during SSR, accesses `document.createElement('canvas')` or `canvas.getContext('2d')`, and crashes with "document is not defined" or causes hydration errors where server HTML doesn't match client render.

**Why it happens:**
- Canvas API is browser-only (no DOM on server)
- Developers forget SSR exists when migrating from pure SPA
- `useEffect` isn't enough — component still renders once on server

**Consequences:**
- Runtime errors in production (Node.js has no Canvas API)
- Blank canvases or missing images
- Hydration errors cause full client-side re-render (performance hit)
- OG image generation fails if Canvas code is in component

**Prevention:**
1. **Use dynamic imports with ssr: false**:
   ```tsx
   const CardCanvas = dynamic(() => import('@/components/CardCanvas'), {
     ssr: false,
     loading: () => <div className="h-[400px] bg-gray-100 animate-pulse" />
   })
   ```
2. **Guard with typeof window**:
   ```tsx
   useEffect(() => {
     if (typeof window === 'undefined') return
     const canvas = document.createElement('canvas')
     // ... canvas logic
   }, [])
   ```
3. **Separate Canvas logic from component** — Keep canvas code in separate file, import dynamically
4. **Add loading placeholder** — Show skeleton UI while Canvas component loads

**Detection:**
- "document is not defined" errors in server logs
- "canvas is not defined" in build output
- Hydration warnings about canvas elements
- Canvas elements appear blank on first load

**Phase impact:** Interactive Components phase, specifically card generation feature. Canvas must be client-only from day 1.

**Sources:**
- [Next.js Hydration Errors](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)
- [Handling Hydration Errors](https://medium.com/@aviralj02/handling-hydration-errors-in-next-js-79714bab3a3a)
- [Official Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)

---

### Pitfall 4: localStorage as State Source of Truth

**What goes wrong:** Migrating `localStorage.getItem('cards')` directly to Next.js causes:
1. "localStorage is not defined" errors during SSR
2. Hydration mismatches when server renders default state but client has localStorage state
3. Flash of wrong content (FOUC) — user sees empty state, then localStorage state pops in

**Why it happens:**
- localStorage is browser-only API
- Vite/React SPAs render entirely client-side, so localStorage always exists
- Developers don't consider server/client state divergence

**Consequences:**
- SSR crashes or returns errors
- Hydration warnings spam console
- Poor UX — content "jumps" after load
- Can't pre-render personalized content
- SEO suffers (search engines see empty state)

**Prevention:**
1. **Move state to database** — Next.js enables backend, store user data server-side
2. **Use cookies for persistence** — Cookies are available on server and client
3. **Defer localStorage reads to useEffect**:
   ```tsx
   const [cards, setCards] = useState<Card[]>([])

   useEffect(() => {
     const stored = localStorage.getItem('cards')
     if (stored) setCards(JSON.parse(stored))
   }, [])
   ```
4. **Suppress hydration warnings with suppressHydrationWarning** — ONLY for specific elements that differ client/server, NOT globally
5. **Consider this migration an opportunity** — Replace localStorage with proper auth + database

**Detection:**
- "localStorage is not defined" in server logs
- Hydration mismatch warnings
- Content flashes/jumps on page load
- Different content in View Source vs DevTools

**Phase impact:** Data Persistence phase. Plan localStorage → database migration before implementing any persistence.

**Sources:**
- [Vite to Next.js Migration Guide](https://nextjs.org/docs/app/guides/migrating/from-vite)
- [App Router Migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [Next.js Hydration Errors 2026](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)

---

### Pitfall 5: React Router Hash Links Don't "Just Work"

**What goes wrong:** SPA hash navigation (`<Link to="#register" />` or `window.location.hash = "#manifesto"`) doesn't scroll to anchors in Next.js because:
1. `useLocation().hash` doesn't exist in Next.js
2. Hash changes don't trigger re-renders
3. `usePathname()` doesn't include hash fragment

**Why it happens:**
- React Router manages hash-based routing and anchor navigation
- Next.js uses file-system routing, hash is browser-native behavior
- Hash fragment is removed by browser before server sees it

**Consequences:**
- Anchor links don't scroll
- "Jump to section" navigation breaks
- Table of contents broken
- Users expect smooth scroll, get nothing

**Prevention:**
1. **Use Next.js Link component natively** — Supports hash fragments:
   ```tsx
   <Link href="#register">Register</Link>
   ```
2. **Hash is client-only** — `usePathname()` won't see it, use `window.location.hash` in useEffect
3. **Manual scroll for animations**:
   ```tsx
   const scrollToSection = (id: string) => {
     const element = document.getElementById(id)
     element?.scrollIntoView({ behavior: 'smooth' })
   }
   ```
4. **Handle fixed headers** — Account for header offset:
   ```tsx
   element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
   window.scrollBy(0, -80) // header height
   ```

**Detection:**
- Clicking anchor links does nothing
- URL changes but page doesn't scroll
- Error: "useLocation is not defined"

**Phase impact:** Static Content phase. Fix anchor navigation when migrating existing sections with table of contents.

**Sources:**
- [Next.js Link Component](https://nextjs.org/docs/pages/api-reference/components/link)
- [Hash Links in Next.js App Router](https://blog.zenblog.com/how-to-get-the-anchor-or-hash-from-the-url-in-nextjs-15-app-router)
- [Next.js Hash Navigation](https://github.com/vercel/next.js/issues/13659)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or require refactoring.

### Pitfall 6: Tailwind v4 @apply with Theme Variables Fails

**What goes wrong:** Code like this breaks in Tailwind v4:
```css
.custom-class {
  @apply bg-[--house-ai] text-white;
}
```
Error: "Cannot use @apply with theme variables in Tailwind v4"

**Why it happens:**
- Tailwind v4 changes CSS variable handling fundamentally
- `@apply` with arbitrary values has different syntax
- v3 → v4 migration guide is incomplete for edge cases

**Prevention:**
1. **Use direct CSS with @theme**:
   ```css
   .custom-class {
     background: var(--house-ai);
     color: white;
   }
   ```
2. **Declare theme variables properly**:
   ```css
   @theme {
     --color-house-ai: #ec4899;
   }
   ```
3. **Use utility classes directly** — Avoid @apply in v4
4. **Check existing CLAUDE.md** — Landing app already documented this gotcha

**Detection:**
- Build errors mentioning @apply
- Theme variables not resolving
- Custom components missing styles

**Phase impact:** Foundation phase. Set up Tailwind v4 correctly before migrating styled components.

**Sources:**
- [Tailwind v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind v4 Migration 2025](https://medium.com/better-dev-nextjs-react/tailwind-v4-migration-from-javascript-config-to-css-first-in-2025-ff3f59b215ca)
- [Downgrading from Tailwind v4](https://medium.com/@pradeepgudipati/%EF%B8%8F-downgrading-from-tailwind-css-v4-to-v3-a-hard-earned-journey-back-to-stability-88aa841415bf)

---

### Pitfall 7: Tailwind v4 Class Renames Break Existing Styles

**What goes wrong:** Migrating Vite/React code with Tailwind v3 classes causes styles to break silently. Classes like `shadow-sm`, `ring`, `outline-none` render but look different or don't work.

**Why it happens:**
- Tailwind v4 renamed many utilities
- Default values changed (e.g., `ring` is now 1px instead of 3px)
- No build-time warnings for renamed classes

**Consequences:**
- Shadows look wrong (sizes shifted)
- Focus rings too thin
- Outline accessibility broken
- Subtle visual regressions

**Prevention:**
1. **Run automated upgrade tool**:
   ```bash
   npx @tailwindcss/upgrade
   ```
2. **Check critical renames**:
   | v3 | v4 | Notes |
   |----|----|----|
   | `shadow-sm` | `shadow-xs` | Size scale changed |
   | `ring` | `ring-3` | Default width changed 3px → 1px |
   | `outline-none` | `outline-hidden` | Old one didn't hide outline |
   | `flex-grow-*` | `grow-*` | Shortened |
   | `overflow-ellipsis` | `text-ellipsis` | Moved to text namespace |

3. **Search codebase for old classes** — grep for `shadow-sm`, `ring `, `outline-none`
4. **Visual regression test** — Compare screenshots before/after migration

**Detection:**
- Styles look slightly off
- Focus states too subtle
- Drop shadows appear smaller
- Accessibility audit flags missing focus indicators

**Phase impact:** Foundation and Static Content phases. Fix during initial migration, before implementing new features.

**Sources:**
- [Tailwind v4 Complete Guide](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide)
- [Tailwind v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Real-World Migration Steps](https://medium.com/@mridudixit15/real-world-migration-steps-from-tailwind-css-v3-to-v4-c35f4a97ebe1)

---

### Pitfall 8: next-intl LanguageContext Doesn't Map to URL Routing

**What goes wrong:** Vite/React app uses React Context for language switching:
```tsx
const { locale, setLocale } = useLanguageContext()
<button onClick={() => setLocale('en')}>English</button>
```
This doesn't work with next-intl's URL-based routing (`/es/about` vs `/en/about`).

**Why it happens:**
- Context is client-side state
- next-intl uses URL as source of truth
- Locale changes require navigation, not setState

**Consequences:**
- Language switcher doesn't work
- URL and displayed language desync
- Browser back/forward breaks language state
- Can't share language-specific URLs

**Prevention:**
1. **Use next-intl's routing API**:
   ```tsx
   import { useRouter, usePathname } from '@/i18n/routing'

   const router = useRouter()
   const pathname = usePathname()

   const switchLocale = (locale: 'en' | 'es') => {
     router.replace(pathname, { locale })
   }
   ```
2. **Set up proxy.ts correctly** — Must be at `src/proxy.ts` (NOT `src/app/proxy.ts`)
3. **Use always-prefix pattern** — All URLs start with `/es/` or `/en/`
4. **Store locale preference in cookie** — next-intl handles this automatically

**Detection:**
- Language switch button does nothing
- URL doesn't change when switching language
- Refresh reverts to default language
- Error: "useLanguageContext is not defined"

**Phase impact:** Foundation phase if i18n is core feature. Set up routing before migrating content.

**Sources:**
- [next-intl Routing Setup](https://next-intl.dev/docs/routing/setup)
- [App Router i18n without middleware](https://github.com/amannn/next-intl/discussions/975)
- [Next.js 15 i18n with URL Routing](https://medium.com/@thomasaugot/next-js-15-app-router-internationalization-with-url-based-routing-7e49413dc7c1)

---

### Pitfall 9: shadcn/ui Removal Cascades to Dependencies

**What goes wrong:** Removing shadcn/ui Accordion component requires removing:
- Radix UI primitives (@radix-ui/react-accordion)
- Shared component dependencies (other Radix primitives used by multiple components)
- Tailwind classes specific to shadcn/ui structure

Developers remove Accordion, then discover 5 other components break.

**Why it happens:**
- shadcn/ui components share dependencies
- Radix primitives are interdependent
- No clear dependency graph

**Prevention:**
1. **Audit all shadcn/ui usage first**:
   ```bash
   grep -r "from.*@/components/ui" src/
   ```
2. **Migrate by dependency depth** — Independent components first (Button, Badge), composite components last (Accordion, Dialog)
3. **Keep shared primitives** — Don't remove @radix-ui packages until ALL components migrated
4. **Create custom replacements incrementally** — Don't remove until replacement exists
5. **Consider keeping shadcn/ui** — Custom components are time-consuming; is removal necessary?

**Detection:**
- Build errors after removing shadcn/ui component
- Multiple components break from single removal
- Import errors for @radix-ui packages

**Phase impact:** Interactive Components phase. Plan shadcn/ui removal strategy before starting.

**Sources:**
- [shadcn/ui Migration Guide](https://github.com/shadcn-ui/ui/discussions/9562)
- [Best Practices for shadcn/ui](https://insight.akarinti.tech/best-practices-for-using-shadcn-ui-in-next-js-2134108553ae)

---

### Pitfall 10: Dynamic OG Image Font Loading Breaks in Production

**What goes wrong:** OG image generation works locally but fails in production with:
- "Font file not found"
- "Cannot read file at build time"
- Blank OG images or fallback to default font

**Why it happens:**
- Font loading uses `process.cwd()` which differs local vs production
- Edge runtime uses `fetch` for fonts, Node runtime uses `readFile`
- Font files not included in build output
- Wrong path (relative vs absolute)

**Consequences:**
- Social sharing shows ugly default fonts
- OG images look unprofessional
- SEO suffers (images are important ranking signal)

**Prevention:**
1. **Place fonts in project root or public/**:
   ```
   project-root/
     assets/
       Inter-SemiBold.ttf
     public/
       fonts/
   ```
2. **Use absolute paths with process.cwd()**:
   ```tsx
   import { readFile } from 'node:fs/promises'
   import { join } from 'node:path'

   const font = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'))
   ```
3. **Verify font formats** — Use TTF or OTF (NOT WOFF for best performance)
4. **Check runtime** — Edge runtime requires `fetch`, not `readFile`
5. **Test in production mode**:
   ```bash
   bun run build
   bun run start
   # Visit /api/og or OG image route
   ```
6. **Handle font weight correctly**:
   ```tsx
   fonts: [
     {
       name: 'Inter',
       data: fontData,
       style: 'normal',
       weight: 600, // Must match font file
     },
   ]
   ```

**Detection:**
- OG images work locally, fail in production
- Font-related errors in production logs
- Social preview shows system fonts instead of custom fonts
- next/og returns blank images

**Phase impact:** SEO & Metadata phase. Test OG image generation in production mode before deploying.

**Sources:**
- [Next.js OG Image Docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Dynamic OG Images Guide](https://makerkit.dev/blog/tutorials/dynamic-og-image)
- [Font Loading Issues](https://oneuptime.com/blog/post/2026-01-24-nextjs-font-loading-issues/view)

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 11: Environment Variable Prefix Wrong

**What goes wrong:** `import.meta.env.VITE_API_URL` is undefined in Next.js.

**Why it happens:** Next.js uses `NEXT_PUBLIC_` prefix, not `VITE_`.

**Prevention:**
1. Rename in `.env`: `VITE_API_URL` → `NEXT_PUBLIC_API_URL`
2. Find-replace in codebase: `import.meta.env.VITE_` → `process.env.NEXT_PUBLIC_`
3. Update runtime checks:
   - `import.meta.env.MODE` → `process.env.NODE_ENV`
   - `import.meta.env.PROD` → `process.env.NODE_ENV === 'production'`
   - `import.meta.env.DEV` → `process.env.NODE_ENV !== 'production'`
   - `import.meta.env.SSR` → `typeof window !== 'undefined'`

**Sources:**
- [Vite to Next.js Migration](https://nextjs.org/docs/app/guides/migrating/from-vite)

---

### Pitfall 12: Static Asset Paths Break

**What goes wrong:** Images in `src/assets/logo.png` return 404 in Next.js.

**Why it happens:** Vite serves from `src/assets/`, Next.js serves from `public/`.

**Prevention:**
1. Move assets: `src/assets/*` → `public/assets/*`
2. Update imports:
   - `import logo from './assets/logo.png'` → `import logo from '../public/assets/logo.png'`
   - Or use public path: `<img src="/assets/logo.png" />`
3. Update references: `src/assets/` → `/assets/`

**Sources:**
- [Vite to Next.js Migration](https://nextjs.org/docs/app/guides/migrating/from-vite)

---

### Pitfall 13: Metadata in Wrong Place

**What goes wrong:** Trying to use `next/head` in App Router throws errors.

**Why it happens:** App Router uses Metadata API, not `<Head>` component.

**Prevention:**
1. Remove `import { Head } from 'next/head'`
2. Export metadata object in layout/page:
   ```tsx
   export const metadata = {
     title: 'Page Title',
     description: 'Page description',
   }
   ```
3. For dynamic metadata, use `generateMetadata`:
   ```tsx
   export async function generateMetadata({ params }) {
     return { title: `Post: ${params.slug}` }
   }
   ```

**Sources:**
- [Next.js Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

---

### Pitfall 14: Turbopack Cache Stale During Development

**What goes wrong:** Changes don't appear in browser, old code keeps running.

**Why it happens:** Turbopack aggressive caching + Tailwind v4.1+ has known bugs.

**Prevention:**
1. Pin Tailwind to `~4.0.0` (v4.1.18+ has Turbopack bugs)
2. Restart dev server when stuck: `Ctrl+C` → `bun run dev`
3. Clear cache: `rm -rf .next`
4. Check CLAUDE.md — Landing app already documented this

**Sources:**
- Project knowledge (CLAUDE.md, MEMORY.md)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation | Client Component Cascade (#1) | Establish Server-first pattern, create motion wrappers |
| Foundation | Tailwind v4 @apply (#6) | Use direct CSS, set up @theme declarations |
| Foundation | Env variable prefix (#11) | Rename VITE_ → NEXT_PUBLIC_ before starting |
| Static Content | Hash navigation breaks (#5) | Use Next.js Link with hash support, implement smooth scroll |
| Static Content | Tailwind class renames (#7) | Run @tailwindcss/upgrade, manual review of critical styles |
| Interactive Components | Framer Motion everywhere (#2) | Create motion wrappers FIRST, import wrappers not motion directly |
| Interactive Components | Canvas hydration (#3) | Use dynamic import with ssr: false, add loading placeholder |
| Interactive Components | shadcn/ui removal cascade (#9) | Audit dependencies, migrate by depth, keep shared primitives |
| Data Persistence | localStorage SSR crash (#4) | Plan database migration, defer localStorage to useEffect |
| i18n Integration | Context → URL routing (#8) | Set up next-intl routing, use proxy.ts, cookie-based persistence |
| SEO & Metadata | OG image fonts (#10) | Use absolute paths, test in production mode, verify font formats |

---

## Migration-Specific Anti-Patterns

### Anti-Pattern 1: "Big Bang" Migration

**What:** Attempting to migrate entire app in one PR.

**Why bad:** Impossible to debug, merge conflicts, can't isolate failures.

**Instead:** Incremental migration — Start as SPA in Next.js, adopt features one by one.

---

### Anti-Pattern 2: Copy-Paste from Vite Without Adaptation

**What:** Moving React components to Next.js without considering SSR.

**Why bad:** Breaks on server, hydration errors, misses Next.js benefits.

**Instead:** Review each component for browser APIs, add "use client" strategically, refactor for Server Components where possible.

---

### Anti-Pattern 3: Ignoring Official Migration Guide

**What:** Assuming Next.js is "just React" and skipping docs.

**Why bad:** Misses critical setup steps (root layout, [[...slug]], metadata).

**Instead:** Follow official Vite migration guide step-by-step, then adapt features incrementally.

---

## Quick Reference Checklist

Before starting migration:

- [ ] Read official [Vite to Next.js migration guide](https://nextjs.org/docs/app/guides/migrating/from-vite)
- [ ] Audit component tree for "use client" boundaries
- [ ] Create Framer Motion wrapper components
- [ ] Plan localStorage → database migration
- [ ] Check Tailwind v3 → v4 breaking changes
- [ ] Set up next-intl routing (if i18n)
- [ ] Identify Canvas API usage (dynamic import)
- [ ] Test OG image generation in production mode
- [ ] Pin Tailwind to ~4.0.0 (avoid v4.1+ Turbopack bugs)
- [ ] Rename environment variables (VITE_ → NEXT_PUBLIC_)

During migration:

- [ ] Default to Server Components, add "use client" only when needed
- [ ] Import motion wrappers, not Framer Motion directly
- [ ] Use dynamic import with ssr: false for Canvas/browser APIs
- [ ] Defer localStorage reads to useEffect
- [ ] Use Next.js Link for hash navigation
- [ ] Test in production mode (`bun run build && bun run start`)
- [ ] Monitor bundle size with @next/bundle-analyzer

After migration:

- [ ] Remove Vite config and dependencies
- [ ] Verify all animations work
- [ ] Test language switching (if i18n)
- [ ] Validate OG images in social media debuggers
- [ ] Run Lighthouse audit (should match or exceed Vite baseline)
- [ ] Check for hydration warnings in console
- [ ] Verify Canvas rendering client-side only

---

## Confidence Assessment

| Area | Confidence | Evidence |
|------|------------|----------|
| Server/Client Components | HIGH | Official Next.js docs + 2026 community reports |
| Framer Motion | HIGH | Multiple migration guides + GitHub issues |
| Canvas API | HIGH | Next.js hydration docs + SSR best practices |
| localStorage | HIGH | Official migration guide + community patterns |
| Hash navigation | HIGH | Next.js routing docs + community solutions |
| Tailwind v4 | HIGH | Official upgrade guide + 2026 migration reports |
| next-intl | MEDIUM | Routing docs (but not detailed setup gotchas) |
| shadcn/ui | MEDIUM | Community migration guides (not official) |
| OG images | HIGH | Official Next.js docs + font loading guides |

---

## Sources

### Official Documentation
- [Vite to Next.js Migration Guide](https://nextjs.org/docs/app/guides/migrating/from-vite)
- [App Router Migration Guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Next.js OG Image API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [next-intl Routing](https://next-intl.dev/docs/routing)

### Community Resources (2026)
- [App Router Pitfalls (2026-02-11)](https://imidef.com/en/2026-02-11-app-router-pitfalls)
- [Next.js 16 Performance Optimization](https://medium.com/@shirkeharshal210/next-js-performance-optimization-app-router-a-practical-guide-a24d6b3f5db2)
- [Migrating Vite to Next.js 16](https://www.shsxnk.com/blog/migrating-vite-to-nextjs-16)
- [Next.js Hydration Errors 2026](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)
- [Tailwind v4 Complete Guide 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide)

### Framework-Specific
- [Framer Motion Next.js Compatibility](https://medium.com/@dolce-emmy/resolving-framer-motion-compatibility-in-next-js-14-the-use-client-workaround-1ec82e5a0c75)
- [Framer Motion Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)
- [next-intl URL-Based Routing](https://medium.com/@thomasaugot/next-js-15-app-router-internationalization-with-url-based-routing-7e49413dc7c1)
- [Dynamic OG Images Guide](https://makerkit.dev/blog/tutorials/dynamic-og-image)

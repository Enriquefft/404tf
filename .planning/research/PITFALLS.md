# Pitfalls Research: Vite/React SPA to Next.js 16 Migration

**Domain:** Landing page migration (Vite/React SPA → Next.js 16 App Router)
**Researched:** 2026-02-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Incorrect RSC/Client Component Boundaries

**What goes wrong:**
Marking entire layouts or large component trees as Client Components with `'use client'`, bloating the client JavaScript bundle and losing SSR benefits. This is the #1 mistake in App Router migrations.

**Why it happens:**
- Coming from pure SPA mindset where everything is client-side
- Confusion about what needs `'use client'` vs what can be RSC
- Adding `'use client'` to parent components when only children need it
- Framer Motion animations leading to unnecessary client boundary expansion

**How to avoid:**
1. **Default to Server Components** - Only add `'use client'` when you need:
   - State/lifecycle (useState, useEffect)
   - Event handlers (onClick, onChange)
   - Browser APIs (window, localStorage)
   - React Context
   - Framer Motion animations
2. **Push `'use client'` down the tree** - Create small wrapper components for interactive parts:
   ```tsx
   // ❌ WRONG: Entire section is client-side
   'use client'
   export default function Hero() {
     return (
       <section>
         <h1>Static Title</h1>
         <p>Static content</p>
         <motion.div>Animated CTA</motion.div>
       </section>
     )
   }

   // ✅ CORRECT: Only animated component is client
   export default function Hero() {
     return (
       <section>
         <h1>Static Title</h1>
         <p>Static content</p>
         <AnimatedCTA /> {/* Client Component */}
       </section>
     )
   }
   ```
3. **Use `server-only` package** - Import it in files with secrets/database queries to prevent accidental client imports

**Warning signs:**
- Large bundle size in browser dev tools
- Next.js build warnings about client components
- Secrets/API keys in browser network tab (CRITICAL SECURITY ISSUE)
- All pages showing "use client" at the top

**Phase to address:**
Phase 1: Foundation Setup - Establish RSC/Client boundary strategy before migrating features

---

### Pitfall 2: Framer Motion Hydration Errors

**What goes wrong:**
Framer Motion animations cause hydration mismatches because:
1. Motion components rely on browser APIs (window, document) unavailable during SSR
2. Initial render on server doesn't match client render (animations start on client only)
3. Context usage in motion components conflicts with RSC

**Why it happens:**
- Existing Vite/React app uses Framer Motion everywhere with client-side rendering
- Motion components imported directly into Server Components
- Animated components nested deep in server component trees
- Scroll animations using useViewportScroll/useScroll hooks

**How to avoid:**
1. **Create Client Component wrappers** for all Framer Motion usage:
   ```tsx
   // components/client/animated-div.tsx
   'use client'
   import { motion } from 'framer-motion'
   export function AnimatedDiv({ children, ...props }) {
     return <motion.div {...props}>{children}</motion.div>
   }
   ```
2. **Disable SSR for complex animations** using dynamic imports:
   ```tsx
   const AnimatedStats = dynamic(() => import('./animated-stats'), {
     ssr: false
   })
   ```
3. **Use CSS animations for simple effects** that can be server-rendered
4. **Lazy load scroll animations** - only initialize on client:
   ```tsx
   'use client'
   import { useEffect, useState } from 'react'
   import { motion } from 'framer-motion'

   export function ScrollReveal({ children }) {
     const [mounted, setMounted] = useState(false)
     useEffect(() => setMounted(true), [])

     if (!mounted) return <div>{children}</div>
     return <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>{children}</motion.div>
   }
   ```

**Warning signs:**
- Console errors: "Hydration failed because the initial UI does not match"
- Flash of unstyled content (FOUC) on page load
- Animations triggering twice (once on server, once on client)
- `window is not defined` errors in server logs

**Phase to address:**
Phase 2: Component Migration - Create animation wrappers before migrating animated sections

---

### Pitfall 3: Context API Migration from LanguageContext to next-intl

**What goes wrong:**
Attempting to keep custom LanguageContext from Vite app instead of using next-intl's routing-based approach, causing:
1. Context not working in Server Components
2. Duplicate i18n logic (custom + next-intl)
3. Locale not synced with URL routing
4. Translation loading issues across client/server boundary

**Why it happens:**
- Existing LanguageContext pattern familiar and "seems to work"
- Not understanding next-intl's App Router architecture
- Trying to wrap root layout with Context Provider (not allowed in RSC)
- Missing middleware configuration for locale detection

**How to avoid:**
1. **Remove LanguageContext entirely** - Use next-intl's built-in hooks instead:
   ```tsx
   // ❌ OLD: Custom context
   const { language, setLanguage } = useLanguage()

   // ✅ NEW: next-intl hooks
   const t = useTranslations('namespace') // Client Components
   const t = await getTranslations('namespace') // Server Components
   ```
2. **Set up [locale] folder structure**:
   ```
   app/
     [locale]/
       layout.tsx
       page.tsx
       about/
         page.tsx
   ```
3. **Configure middleware** in `src/middleware.ts`:
   ```ts
   import createMiddleware from 'next-intl/middleware'
   export default createMiddleware({
     locales: ['en', 'es', 'fr'],
     defaultLocale: 'en'
   })
   export const config = {
     matcher: ['/', '/(en|es|fr)/:path*']
   }
   ```
4. **Use request configuration** in `src/i18n/request.ts` for Server Components
5. **Wrap Client Components** with `NextIntlClientProvider` in layout

**Warning signs:**
- Locale changes not reflecting in URL
- Translations not loading on page refresh
- "Cannot use Context in Server Component" errors
- Translation hooks not found in Server Components
- Two different i18n systems running simultaneously

**Phase to address:**
Phase 1: Foundation Setup - Replace context before migrating pages

---

### Pitfall 4: Tailwind v4 @import Syntax Confusion

**What goes wrong:**
Using v3 `@tailwind` directives in v4, or treating Tailwind's `@import` as SASS/CSS import, causing:
1. Build failures: "Unknown at rule @tailwind"
2. SASS preprocessor conflicts trying to process `@import "tailwindcss"`
3. No styles loading because directives not recognized
4. Custom theme configuration not working

**Why it happens:**
- Existing Tailwind v3 setup uses `@tailwind base/components/utilities`
- Muscle memory from v3 syntax
- Not reading v4 upgrade guide
- SCSS files interfering with Tailwind's @import processing
- Using JavaScript config file without @config directive

**How to avoid:**
1. **Replace all @tailwind directives** with single import:
   ```css
   /* ❌ OLD: Tailwind v3 in styles.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* ✅ NEW: Tailwind v4 */
   @import "tailwindcss";
   ```
2. **Rename .scss to .css** - v4 includes many CSS features (nesting, variables) that replace SASS needs
3. **Update PostCSS config** to use `@tailwindcss/postcss`:
   ```js
   // postcss.config.mjs
   export default {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   }
   ```
4. **Migrate deprecated utilities**:
   - `bg-opacity-20` → `bg-black/20`
   - `shadow-sm` → `shadow-xs`
   - `rounded-sm` → `rounded-xs`
   - `!flex` → `flex!` (important modifier moves to end)
5. **Add explicit border colors** - Default changed from gray-200 to currentColor:
   ```html
   <!-- ❌ v3: implicit gray border -->
   <div class="border px-4 py-2">

   <!-- ✅ v4: explicit color required -->
   <div class="border border-gray-200 px-4 py-2">
   ```
6. **Use automated upgrade tool**:
   ```bash
   npx @tailwindcss/upgrade
   ```

**Warning signs:**
- Build errors: "Unknown at rule @tailwind"
- No Tailwind styles applied to components
- SASS compiler errors about @import
- Borders appearing black instead of gray
- Shadow sizes looking different than before

**Phase to address:**
Phase 1: Foundation Setup - Run upgrade before any component migration

---

### Pitfall 5: Route Handler Misuse Instead of Server Components

**What goes wrong:**
Creating unnecessary API routes (`/api/data`) and fetching from them in Server Components, adding network overhead and latency.

**Why it happens:**
- SPA mindset: "data fetching requires API endpoints"
- Not understanding Server Components can query databases directly
- Following old Next.js Pages Router patterns
- Thinking all data needs to be "fetched" via HTTP

**How to avoid:**
1. **Query directly in Server Components** - No API route needed:
   ```tsx
   // ❌ WRONG: Unnecessary API route + fetch
   // app/api/products/route.ts
   export async function GET() {
     const products = await db.query.products.findMany()
     return Response.json(products)
   }
   // app/page.tsx
   export default async function Page() {
     const res = await fetch('/api/products')
     const products = await res.json()
     return <ProductList products={products} />
   }

   // ✅ CORRECT: Direct query in Server Component
   // app/page.tsx
   import { db } from '@/lib/db'
   export default async function Page() {
     const products = await db.query.products.findMany()
     return <ProductList products={products} />
   }
   ```
2. **Use Server Actions for mutations** from Client Components:
   ```tsx
   // app/actions.ts
   'use server'
   export async function createContact(formData: FormData) {
     await db.insert(contacts).values({...})
     revalidatePath('/contact')
   }

   // app/contact-form.tsx
   'use client'
   import { createContact } from './actions'
   export function ContactForm() {
     return <form action={createContact}>...</form>
   }
   ```
3. **Only use Route Handlers for**:
   - Webhooks from external services
   - OAuth callbacks
   - Non-React clients (mobile apps, third-party integrations)

**Warning signs:**
- Many files in `app/api/` folder that just proxy database queries
- Network tab showing localhost API calls during SSR
- Slow Time to First Byte (TTFB) due to waterfall requests
- Duplicate data fetching logic (API route + usage code)

**Phase to address:**
Phase 2: Component Migration - Educate on Server Components during feature migration

---

### Pitfall 6: JSON-LD XSS Vulnerability

**What goes wrong:**
Using unsanitized `JSON.stringify()` to output JSON-LD structured data, creating XSS attack vector.

**Why it happens:**
- Not reading Next.js security documentation
- Copy-pasting examples from blogs that don't sanitize
- Not understanding dangerouslySetInnerHTML security implications
- Trusting user-generated or CMS content without validation

**How to avoid:**
1. **Always sanitize < character** when using JSON.stringify:
   ```tsx
   // ❌ WRONG: XSS vulnerability
   const jsonLd = { name: product.name }
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
   />

   // ✅ CORRECT: Sanitized
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{
       __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
     }}
   />
   ```
2. **Or use serialize-javascript package**:
   ```tsx
   import serialize from 'serialize-javascript'
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: serialize(jsonLd) }}
   />
   ```
3. **Validate with schema-dts** for TypeScript safety:
   ```bash
   npm install schema-dts
   ```
4. **Test with Google Rich Results Test** before deploying

**Warning signs:**
- Security audit flags dangerouslySetInnerHTML usage
- No .replace() call after JSON.stringify
- User content in JSON-LD without validation
- Missing `type="application/ld+json"` on script tag

**Phase to address:**
Phase 3: SEO/Content - Implement with security from day one

---

### Pitfall 7: Drizzle Connection Pooling in Serverless

**What goes wrong:**
Creating new database connections on every request in serverless environment (Vercel), exhausting Neon connection limits.

**Why it happens:**
- Not understanding serverless function execution model
- Recreating db instance per request instead of module-level singleton
- Not using Neon's serverless driver (neon-http/neon-websockets)
- Missing connection pooling configuration

**How to avoid:**
1. **Use neon-http driver** for edge/serverless (no connection pooling needed):
   ```ts
   // lib/db.ts
   import { neon } from '@neondatabase/serverless'
   import { drizzle } from 'drizzle-orm/neon-http'

   const sql = neon(process.env.DATABASE_URL!)
   export const db = drizzle(sql)
   ```
2. **For WebSocket driver, use module-level singleton**:
   ```ts
   import { Pool } from '@neondatabase/serverless'
   import { drizzle } from 'drizzle-orm/neon-serverless'

   // ❌ WRONG: New pool per request
   export function getDb() {
     const pool = new Pool({ connectionString: process.env.DATABASE_URL })
     return drizzle(pool)
   }

   // ✅ CORRECT: Module-level singleton
   const pool = new Pool({ connectionString: process.env.DATABASE_URL })
   export const db = drizzle(pool)
   ```
3. **Add ws and bufferutil packages** if using WebSocket driver in Node.js:
   ```bash
   npm install ws bufferutil
   ```
4. **Configure connection pooling** in Neon dashboard if using TCP connections

**Warning signs:**
- Neon dashboard showing "too many connections" errors
- Database queries failing intermittently
- Connection timeout errors in production
- Slow cold starts on Vercel functions

**Phase to address:**
Phase 1: Foundation Setup - Set up database connection correctly from start

---

### Pitfall 8: TanStack Forms Server Action Validation Gaps

**What goes wrong:**
1. Client validation passing but server action receiving empty/invalid data
2. Zod validation errors not properly formatted for display
3. Double validation (client + server) not properly synced
4. Form submission triggered before client validation completes

**Why it happens:**
- TanStack Forms + Server Actions integration is still POC-level maturity
- Client-side validation !== server-side validation
- Type safety doesn't cross client-server boundary
- onServerValidate doesn't automatically use client validators

**How to avoid:**
1. **Always validate in Server Actions** - Never trust client:
   ```ts
   'use server'
   import { z } from 'zod'

   const contactSchema = z.object({
     name: z.string().min(1),
     email: z.string().email(),
     message: z.string().min(10),
   })

   export async function submitContact(formData: FormData) {
     // Server-side validation (required!)
     const result = contactSchema.safeParse({
       name: formData.get('name'),
       email: formData.get('email'),
       message: formData.get('message'),
     })

     if (!result.success) {
       return { error: result.error.flatten() }
     }

     await db.insert(contacts).values(result.data)
     return { success: true }
   }
   ```
2. **Share schema between client and server**:
   ```ts
   // schemas/contact.ts
   export const contactSchema = z.object({...})

   // Client uses for instant feedback
   // Server uses for security
   ```
3. **Handle errors properly** in form component:
   ```tsx
   'use client'
   export function ContactForm() {
     const [result, formAction] = useFormState(submitContact, null)

     return (
       <form action={formAction}>
         {result?.error?.fieldErrors?.email && (
           <span className="text-red-500">{result.error.fieldErrors.email}</span>
         )}
       </form>
     )
   }
   ```
4. **Consider using plain Server Actions** instead of TanStack Forms for complex validation:
   - Simpler mental model
   - Better error handling
   - Less client JavaScript
   - Production-ready patterns

**Warning signs:**
- Form submitting with empty fields reaching server
- Validation errors not displaying properly
- Server errors in production for "invalid" data
- Confusion about where validation happens

**Phase to address:**
Phase 2: Component Migration - Decide on form strategy early

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep entire app as `'use client'` SPA | Fast initial migration, no component refactoring | Lost SEO benefits, large bundle, no RSC advantages | Acceptable for Phase 1 only, MUST refactor in Phase 2 |
| Use Route Handlers for all data | Familiar API pattern from SPA | Extra network hops, slower TTFB, more code | Never - use Server Components instead |
| Disable SSR for all Framer Motion | Avoid hydration issues | Lost SSR benefits, poor Core Web Vitals | Only for complex scroll animations |
| Skip Server Action validation | Faster development | Security vulnerability, data corruption | Never - always validate on server |
| Ignore Tailwind v4 breaking changes | Avoid immediate refactor | Styles break on v4 update | Never - fix before launch |
| Use `output: 'export'` static mode | Simple deployment | Can't use Server Actions, dynamic routes, middleware | Never for this project - needs next-intl middleware |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| next-intl middleware | Forgetting matcher config, breaking non-locale routes | Include all possible routes: `matcher: ['/', '/(en\|es\|fr)/:path*']` |
| Neon serverless | Using TCP driver in edge runtime | Use neon-http for edge, neon-websockets for Node.js runtime |
| Framer Motion | Importing motion directly in Server Components | Create Client Component wrappers, use dynamic imports with ssr: false |
| shadcn/ui | Not setting up path alias correctly | Ensure `@/*` maps to `./` in tsconfig.json |
| TanStack Forms | Assuming client validation = server validation | Duplicate validation logic in Server Action |
| Drizzle migrations | Running migrations from serverless function | Use Neon's migration workflow or run from CI/CD |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Excessive Client Components | Large bundle size, slow TTI | Use RSC by default, add 'use client' only when needed | >500KB JS bundle |
| Framer Motion everywhere | Poor Lighthouse scores | Use CSS animations where possible, lazy load motion | LCP >2.5s |
| Missing Suspense boundaries | Loading spinner for entire page | Wrap async components in Suspense for granular loading | User-perceived lag |
| No image optimization | Slow LCP, large page weight | Use next/image with proper sizing | LCP >2.5s, images >500KB |
| Route Handler waterfalls | Slow TTFB, sequential requests | Fetch in Server Components in parallel | TTFB >600ms |
| Missing revalidatePath | Stale data after mutations | Always call revalidatePath/revalidateTag after Server Actions | User sees old data |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Server-only code in Client Components | API keys exposed in browser bundle | Use `server-only` package to prevent imports |
| Unsanitized JSON-LD | XSS vulnerability | Replace `<` with `\\u003c` in JSON.stringify output |
| Missing Server Action validation | SQL injection, data corruption | Always validate FormData with Zod/Valibot in actions |
| Trusting NEXT_PUBLIC_ vars | Secrets exposed to client | Use plain env vars for server-only secrets |
| Missing CSP headers | XSS attacks | Configure Content-Security-Policy in next.config.js |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Flash of unstyled content (FOUC) | Jarring visual experience | Use Suspense + loading.tsx for smooth transitions |
| Hydration mismatches | Content "jumping" on load | Ensure server/client render same initial HTML |
| Missing loading states | Appears frozen during navigation | Use loading.tsx and Suspense boundaries |
| Locale not in URL | Broken sharing, SEO issues | Use next-intl [locale] routing |
| No error boundaries | White screen on errors | Add error.tsx files for graceful degradation |
| Missing metadata | Poor social sharing | Use generateMetadata in all pages |

## "Looks Done But Isn't" Checklist

- [ ] **Framer Motion animations:** Verified no hydration errors, added 'use client' wrappers
- [ ] **Locale routing:** Tested all language switches, URL reflects locale
- [ ] **JSON-LD validation:** Passed Google Rich Results Test for all schema types
- [ ] **Server Actions:** All mutations have server-side Zod validation
- [ ] **Database queries:** Using neon-http driver, module-level singleton
- [ ] **Client Components:** Bundle size <300KB, only interactive components marked 'use client'
- [ ] **Tailwind v4:** No @tailwind directives, borders have explicit colors
- [ ] **shadcn/ui:** Path alias working, components importing correctly
- [ ] **Metadata:** All pages have generateMetadata with OG images
- [ ] **Error handling:** error.tsx in all route segments
- [ ] **Loading states:** Suspense boundaries on all async components
- [ ] **Revalidation:** All Server Actions call revalidatePath
- [ ] **llms.txt:** File created at /public/llms.txt with proper structure
- [ ] **Structured data:** Organization, WebSite, and relevant page schemas
- [ ] **Security:** All secrets use plain env vars, no NEXT_PUBLIC_ for sensitive data

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RSC/Client boundaries wrong | MEDIUM | 1. Identify large client bundles 2. Create wrapper components 3. Move 'use client' down tree 4. Test for hydration errors |
| Framer Motion hydration | LOW | 1. Wrap motion components with 'use client' 2. Use dynamic import with ssr: false 3. Test on production build |
| Wrong Tailwind syntax | LOW | 1. Run `npx @tailwindcss/upgrade` 2. Replace @tailwind with @import 3. Update border colors 4. Test visual regression |
| Route Handlers instead of RSC | MEDIUM | 1. Move logic from API routes to Server Components 2. Use Server Actions for mutations 3. Delete unused API routes 4. Test data flow |
| JSON-LD XSS | LOW | 1. Add .replace(/</g, '\\u003c') to all JSON.stringify calls 2. Security audit dangerouslySetInnerHTML 3. Test with payload fuzzing |
| TanStack Forms validation gaps | MEDIUM | 1. Add Zod validation to all Server Actions 2. Share schemas between client/server 3. Consider switching to plain Server Actions 4. Test with invalid payloads |
| Drizzle connection exhaustion | HIGH | 1. Switch to neon-http driver 2. Or create module-level Pool singleton 3. Add connection monitoring 4. Load test with Artillery |
| Missing next-intl middleware | LOW | 1. Create src/middleware.ts 2. Configure matcher 3. Test locale routing 4. Verify URL patterns |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RSC/Client boundaries | Phase 1: Foundation | Bundle analyzer shows client JS <300KB, Lighthouse scores >90 |
| Tailwind v4 migration | Phase 1: Foundation | Visual regression tests pass, no @tailwind directives in code |
| next-intl setup | Phase 1: Foundation | Locale switching works, URL reflects locale, middleware runs |
| Drizzle connection | Phase 1: Foundation | Neon dashboard shows stable connection count, no timeouts |
| Framer Motion hydration | Phase 2: Component Migration | No hydration errors in console, animations smooth on load |
| Route Handler misuse | Phase 2: Component Migration | No API routes that just proxy database, TTFB <600ms |
| TanStack Forms validation | Phase 2: Component Migration | All Server Actions have Zod validation, tested with invalid data |
| JSON-LD security | Phase 3: SEO/Content | Security audit passes, Google Rich Results Test validates |
| llms.txt implementation | Phase 3: SEO/Content | File accessible at /llms.txt, follows standard format |
| Missing metadata | Phase 3: SEO/Content | All pages have OG images, Twitter cards, descriptions |

## Sources

**HIGH Confidence (Official Documentation)**
- [Common mistakes with the Next.js App Router and how to fix them - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [Getting Started: Server and Client Components | Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Migrating: Vite | Next.js](https://nextjs.org/docs/app/guides/migrating/from-vite)
- [Guides: JSON-LD | Next.js](https://nextjs.org/docs/app/guides/json-ld)
- [Upgrade guide - Tailwind CSS](https://tailwindcss.com/docs/upgrade-guide)
- [Next.js App Router internationalization (i18n) – next-intl](https://next-intl.dev/docs/getting-started/app-router)
- [Setup locale-based routing – next-intl](https://next-intl.dev/docs/routing/setup)
- [Drizzle ORM - Neon](https://orm.drizzle.team/docs/connect-neon)

**MEDIUM Confidence (Verified Community Sources)**
- [Resolving Framer Motion Compatibility in Next.js 14: The 'use client' Workaround](https://medium.com/@dolce-emmy/resolving-framer-motion-compatibility-in-next-js-14-the-use-client-workaround-1ec82e5a0c75)
- [TanStack Form Next Server Actions Example](https://tanstack.com/form/latest/docs/framework/react/examples/next-server-actions)
- [Next js server actions with tanstack form and zod - TanStack](https://www.answeroverflow.com/m/1354841659245986082)
- [Implementing JSON-LD in Next.js for SEO - Wisp CMS](https://www.wisp.blog/blog/implementing-json-ld-in-nextjs-for-seo)
- [GEO guide: How to optimize your docs for AI search and LLM ingestion | GitBook](https://gitbook.com/docs/guides/seo-and-llm-optimization/geo-guide)
- [What is Generative Engine Optimization (GEO) - llms-txt.io](https://llms-txt.io/blog/what-is-generative-engine-optimization-geo)
- [The Complete Guide to llms.txt: Should You Care About This AI Standard?](https://getpublii.com/blog/llms-txt-complete-guide.html)

---
*Pitfalls research for: Next.js 16 App Router landing page migration*
*Researched: 2026-02-08*

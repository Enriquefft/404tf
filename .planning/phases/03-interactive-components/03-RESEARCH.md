# Phase 3: Interactive Components - Research

**Researched:** 2026-02-09
**Domain:** Next.js 16 Client Components, Framer Motion animations, TanStack Forms with Server Actions
**Confidence:** MEDIUM-HIGH

## Summary

Phase 3 transforms static Server Components into interactive Client Components with scroll detection, animations, form submission, and state persistence. The core challenge is managing hydration boundaries correctly to avoid mismatches while enabling browser-only features (localStorage, IntersectionObserver, window scroll events).

The standard stack uses Next.js 16's "use client" directive for interactive components, Framer Motion for animations (with LazyMotion for bundle optimization), TanStack Forms for type-safe form state, and React's useActionState for Server Actions integration. Key patterns include wrapping browser-dependent logic in useEffect, using next/dynamic with ssr: false for components requiring window/localStorage, and leveraging IntersectionObserver (via react-intersection-observer) for scroll-triggered animations.

Critical gotchas: Framer Motion requires "use client" components, TanStack Forms + Server Actions is POC-level maturity (useActionState may be safer), and hydration errors occur when server-rendered HTML differs from client-rendered output (common with Date.now(), localStorage reads, or viewport checks during render).

**Primary recommendation:** Use "use client" sparingly at component boundaries, wrap all browser API access in useEffect/custom hooks, leverage react-countup with enableScrollSpy for traction numbers, implement localStorage persistence with custom hooks that initialize from null/default on server, and use useActionState with Zod validation for the intent form instead of TanStack Forms if integration proves unstable.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | latest | Declarative animations, scroll-triggered effects, InView detection | Industry standard for React animations, excellent Next.js App Router support, LazyMotion reduces bundle size |
| react-countup | latest | Number count-up animations with scroll spy | Built-in enableScrollSpy for scroll-triggered counting, lightweight, widely adopted |
| react-intersection-observer | latest | IntersectionObserver hook wrapper | Simplifies scroll-into-view detection, React-friendly API, used by Framer Motion |
| zod | latest (already installed) | Runtime type validation for form schemas | Type-safe validation, integrates with Server Actions, already in project dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-form | latest | Type-safe form state management | If complex form logic needed (conditionals, arrays, linked fields); skip for simple forms |
| hamburger-react | latest | Animated hamburger menu icons | Lightweight (1.5KB gzipped), pre-built animations, less code than custom SVG |
| clsx / tailwind-merge | latest (already installed) | Conditional className management | Dynamic styling based on state (navbar scroll, selected intent card) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | GSAP | GSAP has more animation features but larger bundle, steeper learning curve, less React-idiomatic |
| react-countup | Custom useEffect + requestAnimationFrame | More control but reinventing wheel, no scroll spy built-in |
| TanStack Forms | React Hook Form | RHF more mature with Server Actions but less type-safe, TanStack better for complex forms |
| useActionState | TanStack Forms + Server Actions | TanStack experimental, useActionState is React 19 native and more stable |

**Installation:**
```bash
bun add framer-motion react-countup react-intersection-observer hamburger-react
```

Note: zod, clsx, tailwind-merge already installed in Phase 1.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── [locale]/
│       ├── _components/          # Server Components (static)
│       │   ├── Hero.tsx
│       │   └── ...
│       ├── _interactive/         # Client Components (NEW in Phase 3)
│       │   ├── Navbar.client.tsx
│       │   ├── AnnouncementBanner.client.tsx
│       │   ├── TractionBar.client.tsx
│       │   ├── IntentForm.client.tsx
│       │   └── animations/       # Framer Motion wrappers
│       │       ├── FadeInSection.tsx
│       │       ├── FloatingMascot.tsx
│       │       └── AnimatedCard.tsx
│       └── _actions/             # Server Actions (NEW in Phase 3)
│           └── intent.actions.ts
└── hooks/                        # Custom hooks (NEW in Phase 3)
    ├── useScrollDirection.ts
    ├── useLocalStorage.ts
    └── useInView.ts
```

Alternative: Keep client components in `_components/` with `.client.tsx` suffix instead of separate `_interactive/` folder. This matches existing pattern and keeps related code together.

### Pattern 1: Hydration-Safe Client Components

**What:** Components using browser APIs (window, localStorage, IntersectionObserver) must avoid hydration mismatches by deferring browser-dependent logic to useEffect.

**When to use:** Any component with "use client" that reads from window, localStorage, or viewport dimensions.

**Example:**
```typescript
"use client";
import { useState, useEffect } from "react";

export function AnnouncementBanner() {
  // Initialize with neutral state (same on server and client)
  const [isDismissed, setIsDismissed] = useState(false);

  // Read from localStorage AFTER hydration (client-only)
  useEffect(() => {
    const dismissed = localStorage.getItem("banner-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("banner-dismissed", "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="banner">
      Content
      <button onClick={handleDismiss}>Dismiss</button>
    </div>
  );
}
```

**Why this works:** Server renders with `isDismissed = false`, client hydrates with same value, then useEffect updates state after hydration completes. No mismatch.

### Pattern 2: Scroll Direction Detection for Navbar

**What:** Track scroll direction to show/hide navbar on scroll down/up.

**When to use:** Sticky/fixed navbars that should hide when scrolling down to save screen space.

**Example:**
```typescript
"use client";
import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection);
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection]);

  return scrollDirection;
}

// Usage in Navbar
export function Navbar() {
  const scrollDirection = useScrollDirection();

  return (
    <nav className={clsx(
      "fixed top-0 transition-transform duration-300",
      scrollDirection === "down" && "translate-y-[-100%]",
      scrollDirection === "up" && "translate-y-0"
    )}>
      {/* nav content */}
    </nav>
  );
}
```

**Source:** [DEV Community - Navbar hide/show on scroll](https://dev.to/biomathcode/navbar-hide-and-show-on-scroll-using-custom-react-hooks-1k98)

### Pattern 3: IntersectionObserver with react-countup

**What:** Trigger count-up animation when TractionBar scrolls into viewport.

**When to use:** Stats/metrics sections that should animate on first view.

**Example:**
```typescript
"use client";
import CountUp from "react-countup";

export function TractionBar() {
  const stats = [
    { value: 400, suffix: "+", label: "Community Members" },
    { value: 250, suffix: "+", label: "Event Attendees" },
    { value: 92, suffix: "+", label: "Applicants" },
    { value: 15, suffix: "", label: "Fellows" },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label}>
          <CountUp
            end={stat.value}
            duration={2}
            enableScrollSpy
            scrollSpyOnce
            suffix={stat.suffix}
          />
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
```

**Source:** [react-countup npm](https://www.npmjs.com/package/react-countup) - `enableScrollSpy` added in recent versions.

### Pattern 4: Framer Motion Scroll Animations

**What:** Fade in sections when they scroll into view using Framer Motion's useInView hook.

**When to use:** Progressive reveal of content sections (Houses, Programs, Events, etc.).

**Example:**
```typescript
"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Usage: Wrap server component sections
import { Hero } from "./_components/Hero";

export default function Page() {
  return (
    <>
      <Hero /> {/* No animation on hero */}
      <FadeInSection>
        <Houses />
      </FadeInSection>
      <FadeInSection>
        <Programs />
      </FadeInSection>
    </>
  );
}
```

**Source:** [Framer Motion useInView](https://www.framer.com/motion/scroll-animations/)

**Alternative:** Use `whileInView` prop directly on motion components instead of useInView hook:
```typescript
<motion.div
  whileInView={{ opacity: 1, y: 0 }}
  initial={{ opacity: 0, y: 50 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true, margin: "-100px" }}
>
```

### Pattern 5: Server Actions with useActionState and Zod

**What:** Type-safe form submission with server-side validation and database persistence.

**When to use:** Intent form submission (INTER-04, INTER-05 requirements).

**Example:**
```typescript
// src/app/[locale]/_actions/intent.actions.ts
"use server";
import { z } from "zod";
import { db } from "@/db";
import { intentSubmissions } from "@/db/schema";

const intentSchema = z.object({
  intent: z.enum(["build", "collaborate", "connect"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  locale: z.enum(["es", "en"]),
});

export async function submitIntent(prevState: any, formData: FormData) {
  const validatedFields = intentSchema.safeParse({
    intent: formData.get("intent"),
    name: formData.get("name"),
    email: formData.get("email"),
    locale: formData.get("locale"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    await db.insert(intentSubmissions).values(validatedFields.data);
    return { message: "Success! We'll be in touch soon.", errors: null };
  } catch (error) {
    return { message: "Database error. Please try again.", errors: null };
  }
}

// src/app/[locale]/_interactive/IntentForm.client.tsx
"use client";
import { useActionState } from "react";
import { submitIntent } from "../_actions/intent.actions";

export function IntentForm({ locale }: { locale: "es" | "en" }) {
  const [state, formAction, isPending] = useActionState(submitIntent, null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  return (
    <form action={formAction}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="intent" value={selectedIntent || ""} />

      {/* Intent cards with onClick to set selectedIntent */}

      <input name="name" required />
      {state?.errors?.name && <p>{state.errors.name}</p>}

      <input name="email" type="email" required />
      {state?.errors?.email && <p>{state.errors.email}</p>}

      <button type="submit" disabled={isPending || !selectedIntent}>
        {isPending ? "Submitting..." : "Submit"}
      </button>

      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

**Source:** [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms), [React useActionState](https://react.dev/reference/react/useActionState)

**Why useActionState over TanStack Forms:** As noted in STATE.md, TanStack Forms + Server Actions is POC-level maturity. useActionState is React 19's native hook for progressive enhancement with Server Actions, more stable and simpler.

### Pattern 6: Language Switcher with next-intl

**What:** Switch between /es and /en routes while preserving scroll position.

**When to use:** Navbar language switcher requirement (INTER-01).

**Example:**
```typescript
"use client";
import { useRouter, usePathname } from "next-intl/client";

export function LanguageSwitcher({ currentLocale }: { currentLocale: "es" | "en" }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: "es" | "en") => {
    router.replace(pathname, { locale: newLocale, scroll: false });
  };

  return (
    <div>
      <button
        onClick={() => switchLanguage("es")}
        className={currentLocale === "es" ? "font-bold" : ""}
      >
        ES
      </button>
      <span>|</span>
      <button
        onClick={() => switchLanguage("en")}
        className={currentLocale === "en" ? "font-bold" : ""}
      >
        EN
      </button>
    </div>
  );
}
```

**Source:** [next-intl GitHub Discussion #532](https://github.com/amannn/next-intl/discussions/532), [Issue #672](https://github.com/amannn/next-intl/issues/672)

**Note:** The `scroll: false` option preserves scroll position during locale switch. next-intl's router is a wrapper around Next.js router with i18n support.

### Pattern 7: Hamburger Menu with State Management

**What:** Animated mobile menu toggle with open/close state.

**When to use:** Navbar mobile menu (INTER-01 requirement).

**Example:**
```typescript
"use client";
import { useState } from "react";
import Hamburger from "hamburger-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden">
        <Hamburger toggled={isOpen} toggle={setIsOpen} size={20} />
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b">
          {/* Mobile menu content */}
        </div>
      )}
    </>
  );
}
```

**Source:** [hamburger-react](https://hamburger-react.netlify.app/)

**Alternative:** Use Framer Motion's AnimatePresence for menu slide-in animation:
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* menu */}
    </motion.div>
  )}
</AnimatePresence>
```

### Anti-Patterns to Avoid

- **Reading localStorage during render:** Causes hydration mismatch. Always use useEffect to read browser storage.
- **Conditional "use client" directive:** The directive must be at top of file, cannot be conditional. Split into separate files if needed.
- **Overusing dynamic imports:** Only use `next/dynamic` with `ssr: false` for components that truly cannot SSR (e.g., third-party widgets using window). Most Client Components can SSR safely.
- **Framer Motion without LazyMotion:** Import full framer-motion increases bundle by ~30KB. Use LazyMotion for production:
  ```typescript
  import { LazyMotion, domAnimation } from "framer-motion";

  <LazyMotion features={domAnimation}>
    {/* motion components */}
  </LazyMotion>
  ```
- **Form validation on client only:** Always validate on server with Zod in Server Action, client validation is UX enhancement but not security.
- **Suppressing hydration warnings with suppressHydrationWarning:** This hides the problem instead of fixing it. Refactor to eliminate mismatch.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Count-up animation | Custom requestAnimationFrame loop with state | react-countup | Handles easing, decimal precision, scroll spy, thousands separators, prefix/suffix |
| IntersectionObserver hook | Manual useEffect with observer setup/cleanup | react-intersection-observer | Handles edge cases, SSR safety, ref management, threshold/margin options |
| Scroll direction detection | Manual scroll event listener comparing positions | Custom useScrollDirection hook (see Pattern 2) | Needs debouncing, threshold logic, cleanup, initial state handling |
| Hamburger menu animation | Custom CSS transitions and SVG transforms | hamburger-react | Tiny bundle (1.5KB), 10+ animation styles, accessibility built-in |
| Form state with arrays/conditionals | Manual useState for each field, custom validation | TanStack Forms (if complex) or useActionState (if simple) | Type-safety, validation timing, touched/dirty state, field arrays |
| localStorage persistence | Manual getItem/setItem in components | Custom useLocalStorage hook with SSR safety | Handles SSR/CSR mismatch, serialization, fallback values, sync across tabs |
| Scroll-triggered animations | Manual IntersectionObserver + useState | Framer Motion useInView or whileInView | Handles cleanup, multiple elements, animation variants, stagger effects |

**Key insight:** Client-side interactions have many edge cases (SSR/CSR mismatch, event cleanup, browser API availability, performance optimization). Libraries exist because these patterns have been battle-tested across thousands of apps. Custom solutions often miss edge cases until production.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from Browser APIs

**What goes wrong:** Component reads from localStorage, window.innerWidth, or Date.now() during render, causing server HTML to differ from client's first render.

**Why it happens:** Server has no window/localStorage, so server renders null/"" but client renders actual value on first pass, before useEffect runs.

**How to avoid:**
1. Initialize state with server-safe default (empty string, false, null)
2. Read browser API only in useEffect (after hydration)
3. Never use `typeof window !== "undefined"` checks in JSX rendering logic

**Warning signs:**
- Console error: "Text content does not match server-rendered HTML"
- Console error: "Hydration failed because the initial UI does not match"
- Component flashes/re-renders after page load

**Example of pitfall:**
```typescript
// ❌ WRONG - causes hydration error
function Component() {
  const [isDark, setIsDark] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );
  // Server: isDark = false (no window)
  // Client first render: isDark = true (localStorage exists)
  // MISMATCH!
}

// ✅ CORRECT
function Component() {
  const [isDark, setIsDark] = useState(false); // Same on server & client

  useEffect(() => {
    setIsDark(localStorage.getItem("theme") === "dark"); // Client-only
  }, []);
}
```

**Source:** [Next.js Hydration Errors 2026](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)

### Pitfall 2: Framer Motion Router Context Instability

**What goes wrong:** Framer Motion animations break during Next.js navigation because App Router updates context frequently, causing components to unmount/remount mid-animation.

**Why it happens:** Next.js App Router's aggressive route updates interfere with Framer Motion's animation lifecycle management.

**How to avoid:**
1. Use AnimatePresence with mode="wait" for route transitions
2. For complex cases, implement FrozenRouter pattern to stabilize context during animations
3. Prefer CSS transitions for simple animations that don't need React state

**Warning signs:**
- Animations cut off abruptly during navigation
- Motion components flicker or reset mid-animation
- Console warnings about unmounting components with active animations

**Source:** [NEXT-1151 App router issue with Framer Motion](https://github.com/vercel/next.js/issues/49279), [Solving Framer Motion Page Transitions](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router)

### Pitfall 3: TanStack Forms + Server Actions Immaturity

**What goes wrong:** TanStack Forms has experimental Server Actions support that may have bugs, incomplete TypeScript types, or breaking changes.

**Why it happens:** TanStack Forms was designed for client-side validation; Server Actions integration is newer and not as battle-tested as other parts of the library.

**How to avoid:**
1. Use React's useActionState hook for simple forms (1-3 fields, single validation schema)
2. Only use TanStack Forms if you need complex features (field arrays, dependent fields, multi-step forms)
3. If using TanStack Forms, verify current examples work in your Next.js version before implementing

**Warning signs:**
- TypeScript errors about form state types not matching Server Action return types
- Documentation examples that don't work in Next.js 16
- GitHub issues mentioning Server Actions bugs

**Recommendation for this phase:** Use useActionState + Zod for IntentCTA form. It's 3 fields (intent, name, email) with simple validation - doesn't need TanStack Forms complexity.

**Source:** STATE.md blocker, [TanStack Form Next Server Actions Example](https://tanstack.com/form/v1/docs/framework/react/examples/next-server-actions)

### Pitfall 4: Scroll Event Listener Memory Leaks

**What goes wrong:** Adding scroll listeners in useEffect without cleanup causes multiple listeners to accumulate on component re-renders, degrading performance.

**Why it happens:** Forgetting to return cleanup function from useEffect, or missing dependencies causing effect to re-run unnecessarily.

**How to avoid:**
1. Always return cleanup function that removes event listener
2. Throttle/debounce scroll handlers to reduce execution frequency
3. Use passive event listeners for better performance: `{ passive: true }`

**Warning signs:**
- Page scrolling becomes laggy over time
- Multiple console.logs from same handler on single scroll event
- Browser DevTools Performance tab shows excessive JavaScript execution during scroll

**Example:**
```typescript
// ❌ WRONG - no cleanup
useEffect(() => {
  window.addEventListener("scroll", handleScroll);
}, []);

// ✅ CORRECT
useEffect(() => {
  const handleScroll = () => { /* ... */ };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []); // Empty deps = runs once
```

### Pitfall 5: localStorage Key Collisions

**What goes wrong:** Multiple banners/features use generic keys like "dismissed" or "hidden", causing unintended cross-feature state sharing.

**Why it happens:** No naming convention for localStorage keys, developers use simple descriptive names that collide.

**How to avoid:**
1. Prefix all keys with app identifier: `404tf:banner-dismissed`, `404tf:theme`
2. Use feature-specific namespaces: `banner:spechack:dismissed`
3. Document localStorage keys in code comments or shared constants file

**Warning signs:**
- Dismissing one banner dismisses unrelated banners
- Clearing one feature's state breaks another feature
- localStorage debugging shows duplicate or generic key names

**Example:**
```typescript
// ❌ WRONG - generic key
localStorage.setItem("dismissed", "true");

// ✅ CORRECT - namespaced
const BANNER_KEY = "404tf:announcement-spechack:dismissed";
localStorage.setItem(BANNER_KEY, "true");
```

### Pitfall 6: Animating Too Many Elements

**What goes wrong:** Adding Framer Motion to every element (50+ animated components) causes janky scrolling and high bundle size.

**Why it happens:** Overuse of animations without considering performance impact.

**How to avoid:**
1. Limit animations to major sections (5-7 FadeInSections max)
2. Use CSS transforms/transitions for simple animations instead of Framer Motion
3. Implement LazyMotion to reduce bundle size
4. Use `will-change: transform` CSS for elements that will animate

**Warning signs:**
- Scroll performance drops below 60fps
- Main thread blocked during scroll in DevTools Performance tab
- Bundle size increases by 50KB+ from framer-motion

**Recommended animation budget for this phase:**
- Hero mascot: 1 floating animation
- Section reveals: 5-6 FadeInSection wrappers (Houses, Programs, Events, Community, Partners)
- TractionBar: 4 count-up animations
- Intent cards: 3 card selection animations
- Total: ~15 animated elements (reasonable for landing page)

## Code Examples

Verified patterns from official sources:

### Custom useLocalStorage Hook (SSR-Safe)

```typescript
"use client";
import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // State to store our value
  // Initialize with initialValue (same on server and client)
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage AFTER hydration
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

**Source:** [Josh Comeau - Persisting React State in localStorage](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/)

**Usage:**
```typescript
const [isDismissed, setIsDismissed] = useLocalStorage("404tf:banner:dismissed", false);
```

### Navbar with Scroll Direction Detection

```typescript
"use client";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      // Only update if scroll delta > 10px to avoid jitter
      if (
        direction !== scrollDirection &&
        Math.abs(scrollY - lastScrollY) > 10
      ) {
        setScrollDirection(direction);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection]);

  return scrollDirection;
}

export function Navbar() {
  const scrollDirection = useScrollDirection();

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-40",
        "bg-background/80 backdrop-blur-xl border-b border-border",
        "transition-transform duration-300",
        scrollDirection === "down" && "-translate-y-full"
      )}
    >
      {/* Navbar content */}
    </nav>
  );
}
```

### Intent Form with Server Action

```typescript
// src/app/[locale]/_actions/intent.actions.ts
"use server";
import { z } from "zod";
import { db } from "@/db";
import { intentSubmissions } from "@/db/schema";

const intentSchema = z.object({
  intent: z.enum(["build", "collaborate", "connect"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  locale: z.enum(["es", "en"]),
});

type FormState = {
  message: string;
  errors?: {
    intent?: string[];
    name?: string[];
    email?: string[];
  };
} | null;

export async function submitIntent(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = intentSchema.safeParse({
    intent: formData.get("intent"),
    name: formData.get("name"),
    email: formData.get("email"),
    locale: formData.get("locale"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await db.insert(intentSubmissions).values(validatedFields.data);
    return { message: "Success! We'll be in touch soon." };
  } catch (error) {
    console.error("Database error:", error);
    return { message: "Database error. Please try again." };
  }
}

// src/app/[locale]/_interactive/IntentForm.client.tsx
"use client";
import { useActionState, useState } from "react";
import { submitIntent } from "../_actions/intent.actions";
import { clsx } from "clsx";

const intents = [
  { key: "build" as const, emoji: "🔬", labelKey: "build" },
  { key: "collaborate" as const, emoji: "🤝", labelKey: "collaborate" },
  { key: "connect" as const, emoji: "🌐", labelKey: "connect" },
];

export function IntentForm({
  locale,
  translations,
}: {
  locale: "es" | "en";
  translations: {
    build: string;
    collaborate: string;
    connect: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    submit: string;
  };
}) {
  const [state, formAction, isPending] = useActionState(submitIntent, null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="intent" value={selectedIntent || ""} />

      {/* Intent cards */}
      <div className="flex flex-col md:flex-row gap-4">
        {intents.map((intent) => (
          <button
            key={intent.key}
            type="button"
            onClick={() => setSelectedIntent(intent.key)}
            className={clsx(
              "flex-1 rounded-xl border-2 p-6 text-center transition-all duration-300",
              selectedIntent === intent.key
                ? "border-white/60 bg-white/20 scale-105"
                : "border-white/20 bg-white/10 hover:bg-white/15"
            )}
          >
            <span className="text-3xl mb-3 block">{intent.emoji}</span>
            <span className="font-orbitron text-sm font-bold text-primary-foreground">
              {translations[intent.labelKey]}
            </span>
          </button>
        ))}
      </div>
      {state?.errors?.intent && (
        <p className="text-red-300 text-sm">{state.errors.intent[0]}</p>
      )}

      {/* Name field */}
      <div>
        <input
          type="text"
          name="name"
          placeholder={translations.namePlaceholder}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
          required
        />
        {state?.errors?.name && (
          <p className="text-red-300 text-sm mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Email field */}
      <div>
        <input
          type="email"
          name="email"
          placeholder={translations.emailPlaceholder}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
          required
        />
        {state?.errors?.email && (
          <p className="text-red-300 text-sm mt-1">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending || !selectedIntent}
        className={clsx(
          "w-full px-6 py-3 rounded-lg font-semibold transition-opacity",
          isPending || !selectedIntent
            ? "bg-white/20 cursor-not-allowed opacity-50"
            : "bg-white text-purple-600 hover:opacity-90"
        )}
      >
        {isPending ? "Submitting..." : translations.submit}
      </button>

      {/* Status message */}
      {state?.message && (
        <p
          className={clsx(
            "text-center text-sm",
            state.message.includes("Success") ? "text-green-300" : "text-red-300"
          )}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
```

**Source:** [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms), [Handling Forms in Next.js with useActionState and Zod](https://medium.com/@sorayacantos/handling-forms-in-next-js-with-next-form-server-actions-useactionstate-and-zod-validation-15f9932b0a9e)

### Floating Mascot Animation

```typescript
"use client";
import { motion } from "framer-motion";

export function FloatingMascot({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
```

**Usage in Hero Server Component:**
```typescript
// src/app/[locale]/_components/Hero.tsx
import { FloatingMascot } from "../_interactive/animations/FloatingMascot";

export async function Hero() {
  return (
    <section>
      <FloatingMascot>
        <Image src={mascotImage} alt="Mascot" />
      </FloatingMascot>
    </section>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Hook Form for all forms | useActionState for simple forms, RHF for complex | React 19 (2024) | useActionState is built-in, lighter weight, progressive enhancement |
| useFormStatus (Next.js 14) | useActionState (Next.js 15+) | Next.js 15 (2024) | useFormStatus deprecated, useActionState is canonical |
| react-scroll-parallax | Framer Motion useScroll + useTransform | 2023-2024 | Framer Motion is more comprehensive, better App Router support |
| Custom IntersectionObserver hooks | react-intersection-observer library | 2022+ | Battle-tested, handles edge cases, better TypeScript |
| Radix UI Accordion for mobile menu | hamburger-react + simple show/hide | 2025+ | Hamburger menu doesn't need ARIA complexity of accordion |
| suppressHydrationWarning for time/date | useEffect for client-only rendering | Ongoing | suppressHydrationWarning is escape hatch, not solution |

**Deprecated/outdated:**
- **useFormStatus:** Replaced by useActionState in Next.js 15+. Migration: replace `const { pending } = useFormStatus()` with `const [state, formAction, isPending] = useActionState(...)`
- **next-intl's middleware.ts:** Next.js 16 uses proxy.ts convention (already implemented in Phase 1)
- **Framer Motion m.div shorthand:** Works but longer `motion.div` is more explicit and better for tree-shaking
- **CountUp.js (vanilla):** Use react-countup wrapper for React integration, cleaner API

## Open Questions

Things that couldn't be fully resolved:

1. **TanStack Forms + Server Actions stability**
   - What we know: Official example exists, integration is documented
   - What's unclear: Production stability, TypeScript edge cases, Next.js 16 compatibility
   - Recommendation: Skip TanStack Forms for this phase, use simpler useActionState pattern. If complex forms needed later, revisit with latest docs

2. **Optimal animation performance threshold**
   - What we know: Too many animations hurt performance, LazyMotion reduces bundle size
   - What's unclear: Exact threshold for "too many" on landing page (varies by device)
   - Recommendation: Start with 15 animated elements (hero, 5-6 sections, 4 stats, 3 cards), measure with Lighthouse, reduce if performance score < 90

3. **localStorage security for banner dismissal**
   - What we know: localStorage is domain-scoped, but user can manually edit
   - What's unclear: Whether to add hash/signature to prevent manual re-enabling of dismissed banners
   - Recommendation: Not needed for announcement banner (low stakes). If banner contains important legal notice, consider cookie with HttpOnly flag instead

4. **next-intl language switcher scroll position**
   - What we know: `router.replace(..., { scroll: false })` should preserve position
   - What's unclear: Whether this works reliably in Next.js 16 App Router with shallow routing
   - Recommendation: Implement and test. If scroll resets, fallback to manual scroll restoration with `window.scrollTo(0, savedPosition)`

5. **Framer Motion vs CSS transitions for simple animations**
   - What we know: CSS transitions have better performance for simple animations
   - What's unclear: At what complexity does Framer Motion become worth the bundle cost
   - Recommendation: Use CSS for static transitions (hover, focus states), Framer Motion for scroll-triggered, orchestrated, or complex animations

## Sources

### Primary (HIGH confidence)
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms) - Server Actions, useActionState patterns
- [React useActionState](https://react.dev/reference/react/useActionState) - Official React 19 hook documentation
- [react-countup npm](https://www.npmjs.com/package/react-countup) - enableScrollSpy feature
- [hamburger-react](https://hamburger-react.netlify.app/) - Official library documentation
- [Biome Linter Configuration](https://biomejs.dev/linter/) - Rules configuration syntax
- [Tailwind CSS Gradients](https://tailwindcss.com/docs/background-image) - Official gradient utilities

### Secondary (MEDIUM confidence)
- [Next.js Hydration Errors in 2026](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702) - Verified with official Next.js docs
- [Framer Motion Next.js Compatibility](https://medium.com/@dolce-emmy/resolving-framer-motion-compatibility-in-next-js-14-the-use-client-workaround-1ec82e5a0c75) - Matches Framer Motion docs
- [Josh Comeau - Persisting React State in localStorage](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - Reputable source, pattern verified
- [DEV Community - Navbar hide/show on scroll](https://dev.to/biomathcode/navbar-hide-and-show-on-scroll-using-custom-react-hooks-1k98) - Common pattern, verified approach
- [TanStack Form React Server Actions Example](https://tanstack.com/form/v1/docs/framework/react/examples/next-server-actions) - Official but redirected (303), POC-level per STATE.md

### Tertiary (LOW confidence)
- [next-intl language switcher scroll preservation](https://github.com/amannn/next-intl/issues/672) - GitHub issue (feature request), not confirmed as implemented
- [Builder.io React Intersection Observer Guide](https://www.builder.io/blog/react-intersection-observer) - Third-party tutorial, pattern looks correct but not official
- WebSearch results for gradient preservation - No authoritative source found, general Tailwind CSS knowledge

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified on npm, Next.js docs confirm Server Actions + useActionState
- Architecture: MEDIUM-HIGH - Patterns are standard but Next.js 16 is new, some details need verification during implementation
- Pitfalls: HIGH - Hydration errors well-documented, localStorage SSR issues common knowledge, TanStack Forms concern from STATE.md

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days - stable ecosystem for established libraries like Framer Motion, React hooks. Next.js 16 may have updates but core patterns stable)

**Recommended verification during planning:**
- Test next-intl `scroll: false` option with Next.js 16 (open question #4)
- Verify react-countup `enableScrollSpy` works with latest version
- Check if hamburger-react needs peer dependencies or additional config
- Confirm Biome doesn't have false positives with useActionState (like it did with useUniqueElementIds)

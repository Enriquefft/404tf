# Phase 5: Trading Cards - Research

**Researched:** 2026-02-14
**Domain:** Canvas API, Framer Motion animations, social sharing, Next.js client components
**Confidence:** HIGH

## Summary

Phase 5 builds the trading card system: a visual card component, animated reveal after registration, Canvas-based PNG export, social sharing, and a fanned card preview in the Hero section. The blueprint (original Vite SPA) has a complete reference implementation that needs adaptation to Next.js App Router patterns (server-first, translation prop-drilling, named exports, no default exports).

The core challenge is straightforward -- all components are client-side interactive features. The blueprint code maps cleanly to the Next.js architecture. The main adaptations are: (1) replacing the blueprint's `useLang()` context + `t.cards.*` i18n with next-intl translation props drilled from server components, (2) converting default exports to named exports, (3) removing `forwardRef` (not needed in React 19), and (4) adding the `CITY_FLAGS` map and Canvas rendering functions to the existing `card-utils.ts`.

**Primary recommendation:** Port the blueprint components with minimal changes. The blueprint code is well-structured and the visual design is finalized. Focus on clean Next.js adaptation rather than redesign.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^12.34.0 | Card reveal animation, fanned preview hover | Already used throughout project |
| lucide-react | ^0.564.0 | Download, Share2, Copy, Check, Swords icons | Already used in project |
| next-intl | ^4.8.2 | Translation prop-drilling for card strings | Project i18n standard |

### No Additional Dependencies Needed

The entire phase can be built with existing dependencies. Canvas API is native browser. Clipboard API is native browser. Social share links are just URL construction.

## Architecture Patterns

### New Files to Create
```
src/
  app/[locale]/_components/
    TradingCard.tsx          # Visual card component (client)
    CardReveal.tsx           # Post-registration card + actions (client)
    TradingCardPreview.tsx   # Fanned cards for Hero (client)
  lib/
    card-utils.ts            # EXTEND: add CardData, CITY_FLAGS, Canvas, download, localStorage
    share-utils.ts           # NEW: social sharing URL builders
```

### Existing Files to Modify
```
src/
  app/[locale]/_components/
    RegistrationForm.tsx     # Replace success state with CardReveal
    Hero.tsx                 # Add TradingCardPreview to left column
  messages/
    en.json                  # Add "cards" translation namespace
    es.json                  # Add "cards" translation namespace
```

### Pattern: Translation Prop-Drilling for Card Components

The blueprint uses `useLang()` context + inline `t.cards.*` objects. In Next.js, the pattern is:

**Server component (Hero.tsx)** calls `getTranslations("cards")` and passes translated strings as props to client components. This means CardReveal and TradingCardPreview receive all display strings as props.

```typescript
// Hero.tsx (server component)
const cardT = await getTranslations("cards");
// Pass to CardReveal via RegistrationForm
translations={{
  ...existingTranslations,
  download: cardT("download"),
  shareX: cardT("shareX"),
  challenge: cardT("challenge"),
  // etc.
}}
```

### Pattern: CardData Type as Single Source of Truth

Define `CardData` in `card-utils.ts` and use it everywhere. The server action already returns the needed fields; CardReveal reconstructs a `CardData` object from the action response.

```typescript
export type CardData = {
  agentNumber: string;
  name: string;
  city: string;
  track: "virtual" | "hub";
  builderClass: BuilderClass;
  gradient: { from: string; to: string; angle: number };
};
```

### Pattern: RegistrationForm State Transition

Currently `RegistrationForm` has a simple success state showing agent number text. Phase 5 replaces this with `CardReveal` component that receives the full card data from the server action response.

The `RegisterFormState.data` already returns: `agentNumber`, `name`, `builderClass`, `builderClassDesc`, `gradientData`. Two fields are missing for full `CardData`: **city** and **track**. These are available from the form state itself (the form tracks `track` in local state, and `city` is in the form fields).

**Solution:** RegistrationForm constructs `CardData` from `state.data` + local form values:
```typescript
if (state?.success) {
  const cardData: CardData = {
    agentNumber: state.data.agentNumber,
    name: state.data.name,
    city: cityValue, // from form input or ref
    track: track,    // from useState
    builderClass: {
      name: state.data.builderClass,
      desc: state.data.builderClassDesc,
    },
    gradient: JSON.parse(state.data.gradientData),
  };
  return <CardReveal card={cardData} translations={translations} />;
}
```

**Important:** Need to capture `city` value before form submission clears the form. Use a ref or controlled input state.

### Anti-Patterns to Avoid
- **Using `useContext` for language:** The project uses translation prop-drilling, not context
- **Default exports:** Project requires named exports for all non-Next.js-special files
- **`forwardRef`:** React 19 passes ref as a regular prop; no wrapper needed
- **Server-side Canvas:** Canvas API is browser-only; all Canvas code must be in client components or `"use client"` utility files

## What Exists in Blueprint vs What Needs Porting

### card-utils.ts -- Gap Analysis

| Feature | Blueprint has | Spechack has | Action |
|---------|--------------|-------------|--------|
| `BUILDER_CLASSES` | Yes | Yes (identical) | None |
| `hashStr()` | Yes | Yes (identical) | None |
| `GRADIENT_COMBOS` | Yes | Yes (identical) | None |
| `generateCardGradient()` | Yes | Yes (identical) | None |
| `getRandomBuilderClass()` | Yes | Yes (identical) | None |
| `getDeterministicBuilderClass()` | Yes | Yes (identical) | None |
| `CardData` type | Yes | **No** | Add |
| `CITY_FLAGS` map | Yes (25 cities) | **No** | Add |
| `getCountryFlag()` | Yes | **No** | Add |
| `drawCardToCanvas()` | Yes (full 600x800 renderer) | **No** | Add to separate client file |
| `downloadCard()` | Yes | **No** | Add to separate client file |
| `saveCardToStorage()` | Yes | **No** | Add to separate client file |
| `loadCardFromStorage()` | Yes | **No** | Add to separate client file |
| `generateAgentNumber()` | Yes | **No** (not needed, DB serial) | Skip |
| `generateDeterministicCard()` | Yes | **No** (not needed) | Skip |

**Key decision:** `card-utils.ts` is currently server-safe (no browser APIs). Canvas/download/localStorage functions use `document` and `window`. Two options:
1. **Split into two files:** Keep `card-utils.ts` server-safe, create `card-utils.client.ts` for browser APIs
2. **Add to single file with guards:** Check `typeof window !== "undefined"`

**Recommendation:** Split into two files. `card-utils.ts` stays as-is (shared types + pure functions). New `card-utils.client.ts` has Canvas rendering, download, and localStorage (imported only by client components). This is cleaner and avoids runtime guards.

### Components -- Port Plan

| Blueprint Component | Lines | Key Adaptations |
|---------------------|-------|-----------------|
| `TradingCard.tsx` | 97 | Remove `forwardRef`, remove `useLang()`, receive `locale` as prop, named export |
| `CardReveal.tsx` | 144 | Remove `useLang()`/`t.*`, receive translations as props, named export, use share-utils |
| `TradingCardPreview.tsx` | 82 | Remove `useLang()`/`t.*`, receive translations as props, use static preview data, named export |

### Share Utils -- New File

The blueprint inlines share logic in CardReveal. Better to extract to `share-utils.ts`:

```typescript
// share-utils.ts (client-safe, no server imports)
export function buildTweetUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildLinkedInUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function buildChallengeLink(name: string, origin: string): string {
  return `${origin}/c/${name.split(" ")[0].toLowerCase()}`;
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Social share links | Custom share SDK integration | Simple URL intent patterns | X, WhatsApp, LinkedIn all support URL-based sharing with no SDK needed |
| PNG export | Server-side image generation (e.g., @vercel/og) | Client Canvas API | Card is already rendered in browser; Canvas is simpler, no server cost |
| Clipboard copy | Custom clipboard polyfill | `navigator.clipboard.writeText()` | Modern browsers all support it; graceful fallback not needed for this audience |
| Country flag emoji | Full country-to-flag database | Static `CITY_FLAGS` map (~25 known cities) with "globe" fallback | Hackathon has limited known cities; exhaustive mapping is overkill |

## Common Pitfalls

### Pitfall 1: Canvas Font Rendering
**What goes wrong:** Canvas `fillText()` uses system fonts by default. The card uses Orbitron and JetBrains Mono (Google Fonts loaded via CSS). Canvas may render with fallback monospace if fonts aren't loaded yet.
**Why it happens:** Font loading is async; Canvas doesn't wait for fonts.
**How to avoid:** Use `document.fonts.ready` promise before drawing. The blueprint does NOT handle this -- we should add it:
```typescript
await document.fonts.ready;
const canvas = drawCardToCanvas(card);
```
**Warning signs:** Downloaded PNG shows different fonts than the on-screen card.

### Pitfall 2: City Value Lost After Form Submission
**What goes wrong:** After `useActionState` processes the form, the form inputs may reset. The city value needed for CardData is lost.
**Why it happens:** React form actions can clear uncontrolled inputs.
**How to avoid:** Track city in controlled state (useState) alongside track, or capture it before submission via a ref.
**Warning signs:** Card shows empty city or "Virtual" for all users.

### Pitfall 3: Canvas Emoji Rendering
**What goes wrong:** Country flag emoji in Canvas `fillText()` may render as boxes or tofu on some platforms.
**Why it happens:** Canvas emoji support is inconsistent across OS/browser combos. macOS generally works; Linux/Windows may not.
**How to avoid:** For the downloaded PNG, either: (a) accept platform-dependent emoji rendering, or (b) skip emoji in Canvas and use text-only city display. The blueprint includes emoji -- this is a known limitation.
**Warning signs:** Downloaded PNGs show black rectangles instead of flags.

### Pitfall 4: SSR Errors from Browser APIs
**What goes wrong:** Importing `window.location`, `document.createElement`, `localStorage`, or `navigator.clipboard` in server components causes build errors.
**Why it happens:** Next.js pre-renders on the server where these APIs don't exist.
**How to avoid:** Keep all browser API code in `"use client"` files. The split of `card-utils.ts` (server) vs `card-utils.client.ts` (browser) prevents this.
**Warning signs:** Build errors mentioning "window is not defined" or "document is not defined".

### Pitfall 5: Challenge Link URL Construction
**What goes wrong:** Using `window.location.origin` at module level or during SSR.
**Why it happens:** `window` is not available during server rendering.
**How to avoid:** Construct challenge links only in event handlers or effects, never at render time. Or use `NEXT_PUBLIC_SITE_URL` env var.
**Warning signs:** Hydration mismatch errors or undefined origin.

### Pitfall 6: Translations Prop Surface Area
**What goes wrong:** RegistrationForm's `translations` prop type grows large with all card-related strings added.
**Why it happens:** Phase 5 adds ~10 new translation keys for card actions and sharing.
**How to avoid:** Consider nesting: pass a `cardTranslations` sub-object to keep the prop type organized. Or CardReveal can receive its own translations prop separately.

## Code Examples

### Canvas Drawing Pattern (from blueprint, verified)
```typescript
// Source: spechack-blueprint/src/lib/cardUtils.ts lines 109-191
export function drawCardToCanvas(card: CardData): HTMLCanvasElement {
  const W = 600, H = 800;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Dark background
  ctx.fillStyle = "hsl(240,10%,7%)";
  ctx.fillRect(0, 0, W, H);

  // Gradient overlay at 15% opacity
  const grad = ctx.createLinearGradient(
    0, 0,
    W * Math.cos((card.gradient.angle * Math.PI) / 180),
    H * Math.sin((card.gradient.angle * Math.PI) / 180)
  );
  grad.addColorStop(0, card.gradient.from);
  grad.addColorStop(1, card.gradient.to);
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // ... text elements at specific Y positions
  // Agent number at y=120, Name at y=180, City at y=220, etc.
}
```

### Card Reveal Animation Pattern (from blueprint, verified)
```typescript
// Source: spechack-blueprint/src/components/CardReveal.tsx lines 61-68
<motion.div
  initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  <TradingCard card={card} />
</motion.div>

// Action buttons delayed entry
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
>
  {/* Download, Share, Challenge buttons */}
</motion.div>
```

### Fanned Card Preview Pattern (from blueprint, verified)
```typescript
// Source: spechack-blueprint/src/components/TradingCardPreview.tsx lines 47-73
const rotations = [-6, -2, 2, 6];

{PREVIEW_CARDS.map((card, i) => (
  <motion.div
    key={card.agentNumber}
    className="w-[100px] sm:w-[120px] -ml-8 first:ml-0"
    style={{ rotate: rotations[i], zIndex: i }}
    whileHover={{ y: -10, scale: 1.05, zIndex: 10 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <TradingCard card={card} />
  </motion.div>
))}
```

### Social Share URL Patterns (from blueprint, verified)
```typescript
// X/Twitter intent
`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`

// WhatsApp
`https://wa.me/?text=${encodeURIComponent(text)}`

// LinkedIn (URL-only sharing)
`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

// Clipboard
await navigator.clipboard.writeText(link);
```

## Integration Points

### 1. RegistrationForm Success State Replacement

**Current:** Simple text showing agent number
**New:** Full CardReveal component with animated card + action buttons

The RegistrationForm needs additional translation props for card actions. The `translations` type grows to include card-related strings. Consider splitting into form translations + card translations.

### 2. Hero Left Column -- Card Preview

**Current:** Left column has eyebrow, headline, sub, date, how-link
**New:** Add TradingCardPreview below the existing content

Hero.tsx (server component) needs to:
1. Get card translations: `const cardT = await getTranslations("cards")`
2. Pass preview tagline to TradingCardPreview
3. TradingCardPreview is a client component (hover animations)

### 3. Translation Files

Both `en.json` and `es.json` need a new `"cards"` namespace with all card-related strings. The blueprint's `i18n.ts` has the exact text for both languages in `t.cards.*`.

### 4. Returning User Detection (CARD-09)

The server action already handles duplicate emails (returns existing card data). For localStorage fallback, save card data client-side after successful registration, and check on component mount.

**Approach:**
- Primary: Re-submit email shows existing card (already works in server action)
- Secondary: localStorage saves CardData after reveal; on page load, check localStorage and show card if found
- This means RegistrationForm needs a `useEffect` to check localStorage on mount

## Suggested Plan Breakdown

### Plan 05-01: Card Utilities and Types
- Add `CardData` type to `card-utils.ts`
- Add `CITY_FLAGS` map and `getCountryFlag()` to `card-utils.ts`
- Create `card-utils.client.ts` with `drawCardToCanvas()`, `downloadCard()`, `saveCardToStorage()`, `loadCardFromStorage()`
- Create `share-utils.ts` with URL builder functions
- Add `"cards"` namespace to both `en.json` and `es.json`

### Plan 05-02: TradingCard Component
- Create `TradingCard.tsx` client component
- Port visual layout from blueprint
- Adapt to named export, remove forwardRef, receive locale as prop
- Test with static data

### Plan 05-03: CardReveal and RegistrationForm Integration
- Create `CardReveal.tsx` client component with animation + action buttons
- Modify `RegistrationForm.tsx` to show CardReveal on success
- Add controlled city state to preserve value after submission
- Expand translations prop type
- Wire up download, share, and challenge buttons
- Add localStorage persistence (save on reveal, check on mount)

### Plan 05-04: TradingCardPreview and Hero Integration
- Create `TradingCardPreview.tsx` client component with fanned layout
- Add to Hero.tsx left column below existing content
- Pass card translations from server component
- Static preview data (4 example cards) defined in component

## Open Questions

1. **Challenge link route `/c/:name`**
   - What we know: Blueprint generates `/c/{firstName}` links for sharing
   - What's unclear: Phase 6 handles challenge pages -- should Phase 5 generate links to a route that doesn't exist yet?
   - Recommendation: Generate the links anyway (they're just for sharing text). The route can 404 until Phase 6. Or use the registration `#register` anchor instead.

2. **Canvas font availability**
   - What we know: Card uses Orbitron and JetBrains Mono. Canvas needs fonts loaded.
   - What's unclear: Are these fonts loaded via `next/font` or `@import`? Need to check.
   - Recommendation: Use `document.fonts.ready` before canvas draw. If fonts aren't available, Canvas falls back to monospace which is acceptable.

3. **Builder class description locale in Canvas**
   - What we know: Blueprint hardcodes `card.builderClass.desc.en` in Canvas rendering
   - What's unclear: Should Canvas PNG use the user's current locale?
   - Recommendation: Yes, pass locale to `drawCardToCanvas()` and use `desc[locale]`

## Sources

### Primary (HIGH confidence)
- Blueprint source: `~/Projects/spechack-blueprint/src/` -- complete reference implementation
- Existing codebase: `apps/spechack/src/` -- current state of all files
- Database schema: `packages/database/src/schema.ts` -- participant table structure

### Secondary (MEDIUM confidence)
- Canvas API: MDN Web Docs -- `CanvasRenderingContext2D`, `document.fonts.ready`
- Social sharing: X/Twitter intent API, WhatsApp deep links, LinkedIn sharing URL format

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed, no new packages needed
- Architecture: HIGH -- blueprint provides complete reference, adaptation patterns are clear
- Pitfalls: HIGH -- identified from blueprint code analysis and Next.js SSR constraints
- Integration: HIGH -- existing code is well-structured with clear extension points

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (stable -- no moving targets)

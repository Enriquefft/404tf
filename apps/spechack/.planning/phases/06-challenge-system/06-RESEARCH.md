# Phase 6: Challenge System - Research

**Researched:** 2026-02-14
**Domain:** Next.js dynamic routes, next-intl i18n routing, ImageResponse/Satori OG images, deterministic card generation
**Confidence:** HIGH

## Summary

Phase 6 builds the viral challenge system: shareable `/c/[name]` routes that display deterministic trading cards and dynamic OG images for social media previews. Users visiting `/es/c/Maria` or `/en/c/Maria` see the same trading card for "Maria" every time (deterministic gradient + builder class + placeholder agent number), with a challenge prompt and registration form below. When shared on X/WhatsApp/LinkedIn, the link shows a dynamic OG image rendering the challenger's card.

The core challenges are: (1) creating locale-aware dynamic routes under the existing `[locale]` pattern, (2) implementing deterministic card generation without database lookups (name → card data), (3) generating OG images using Next.js ImageResponse with custom fonts, and (4) handling edge cases where challenge names don't map to registered users.

**Primary recommendation:** Create a nested dynamic route at `app/[locale]/c/[name]/page.tsx` for challenge pages, a parallel `opengraph-image.tsx` route for OG image generation using ImageResponse, and extend `card-utils.ts` with a `generateDeterministicCard()` function that produces consistent CardData from names. The ImageResponse route uses the same card-rendering logic as Canvas but outputs to Satori's JSX-based rendering.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.0.0 | Dynamic routes + ImageResponse API | Framework standard |
| next-intl | ^4.8.2 | Locale-aware routing and translations | Project i18n standard |
| framer-motion | ^12.34.0 | Card animations (reuse from Phase 5) | Already used throughout |

### No Additional Dependencies Needed

The entire phase can be built with existing dependencies. `ImageResponse` is part of `next/og` (bundled with Next.js). Font loading for OG images uses fetch() to read TTF/OTF files from `public/fonts/` or Google Fonts URLs.

## Architecture Patterns

### New Files to Create
```
src/
  app/[locale]/c/[name]/
    page.tsx                    # Challenge page (server component)
    opengraph-image.tsx         # Dynamic OG image route (ImageResponse)
  lib/
    card-utils.ts               # EXTEND: add generateDeterministicCard(), PLACEHOLDER_AGENT_PREFIX
    og-card-renderer.tsx        # NEW: JSX card layout for ImageResponse (Satori-compatible)
```

### Existing Files to Modify
```
src/
  messages/
    en.json                     # Add "challenge" translation namespace
    es.json                     # Add "challenge" translation namespace
  app/[locale]/_components/
    RegistrationForm.tsx        # OPTIONAL: Add optional challengerName prop for analytics/context
```

### Pattern: Nested Dynamic Route with Locale

Next.js 15+ with next-intl uses `[locale]` as the top-level dynamic segment. Challenge routes nest under this:

**Route structure:**
```
app/
  [locale]/                     # Locale segment (es, en)
    c/                          # Challenge namespace
      [name]/                   # Dynamic name segment
        page.tsx                # Challenge page component
        opengraph-image.tsx     # OG image generator
```

**URL examples:**
- `/es/c/Maria` → Spanish challenge page for "Maria"
- `/en/c/John` → English challenge page for "John"

**Params access:**
```typescript
// app/[locale]/c/[name]/page.tsx
type Props = {
  params: Promise<{ locale: string; name: string }>;
};

export default async function ChallengePage({ params }: Props) {
  const { locale, name } = await params;
  setRequestLocale(locale);
  // Generate deterministic card for "name"
}
```

### Pattern: Deterministic Card Generation

Phase 5 generates random builder classes at registration time (stored in database). Phase 6 needs deterministic cards for names that may not exist in the database yet.

**Solution:** Create `generateDeterministicCard()` that uses only the name to produce consistent card data.

```typescript
// card-utils.ts (server-safe)
export function generateDeterministicCard(name: string): CardData {
  const builderClass = getDeterministicBuilderClass(name); // Already exists from Phase 5
  const gradient = generateCardGradient(name); // Already exists from Phase 5

  return {
    agentNumber: "SPEC-????", // Placeholder until registered
    name: name,
    city: "Virtual",
    track: "virtual",
    builderClass: builderClass,
    gradient: gradient,
  };
}
```

**Key insight:** Challenge pages show a "preview" card. The actual agent number is only assigned after registration. This matches the success criteria: "deterministic trading card for 'Maria' with same gradient, builder class, and agent number every time" — the agent number is always "SPEC-????" for unregistered challenge names, ensuring determinism.

**Alternative approach:** Use a hash-based placeholder agent number (e.g., `SPEC-${hashStr(name) % 10000}`). This creates consistent 4-digit numbers for each name without database lookups.

### Pattern: Dynamic OG Image with ImageResponse

Next.js provides `ImageResponse` from `next/og` to generate dynamic OG images. It uses Satori (HTML/CSS to SVG) + Resvg (SVG to PNG).

**File convention:** `app/[locale]/c/[name]/opengraph-image.tsx`

**Basic structure:**
```typescript
// opengraph-image.tsx
import { ImageResponse } from "next/og";
import { generateDeterministicCard } from "@/lib/card-utils";

export const runtime = "edge"; // Required for ImageResponse
export const size = { width: 1200, height: 630 }; // OG standard
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const card = generateDeterministicCard(name);

  // Load custom fonts
  const orbitronBold = await fetch(
    new URL("@/public/fonts/Orbitron-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <OGCardLayout card={card} />,
    {
      ...size,
      fonts: [
        { name: "Orbitron", data: orbitronBold, weight: 700, style: "normal" },
      ],
    }
  );
}
```

**Important:** ImageResponse uses Satori, which only supports **flexbox** (not CSS Grid), and a limited CSS subset. The card layout must be adapted from the HTML-based TradingCard component.

### Pattern: Satori-Compatible Card Layout

Satori limitations require a JSX-based layout using only flexbox and supported CSS. Create a separate component optimized for ImageResponse.

**Key adaptations:**
- No `className` strings with Tailwind utilities (Satori doesn't process Tailwind)
- Inline `style` objects only
- Flexbox for layout (no CSS Grid)
- No background images or `backdrop-filter`
- Limited font support (must load custom fonts explicitly)

**Example structure:**
```typescript
// og-card-renderer.tsx
export function OGCardLayout({ card }: { card: CardData }) {
  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      background: `linear-gradient(${card.gradient.angle}deg, ${card.gradient.from}, ${card.gradient.to})`,
      padding: 60,
    }}>
      <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "Orbitron" }}>
        {card.agentNumber}
      </div>
      <div style={{ fontSize: 64, fontWeight: 900, fontFamily: "Orbitron", marginTop: 20 }}>
        {card.name}
      </div>
      {/* Builder class, city, etc. */}
    </div>
  );
}
```

### Pattern: Challenge Page Layout

The challenge page structure:
1. **Card preview** — Shows deterministic card for challenger
2. **Challenge header** — "[Name] challenges you to join SpecHack"
3. **CTA prompt** — "Do you accept?" / "Register and get your own card"
4. **Registration form** — Standard RegistrationForm component
5. **Success state** — User's own card (not the challenger's card)

```typescript
// app/[locale]/c/[name]/page.tsx
export default async function ChallengePage({ params }: Props) {
  const { locale, name } = await params;
  setRequestLocale(locale);

  const challengerCard = generateDeterministicCard(name);
  const t = await getTranslations("challenge");

  return (
    <main className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Challenger card preview */}
        <div className="w-[240px] mx-auto mb-8">
          <TradingCard card={challengerCard} locale={locale as "es" | "en"} />
        </div>

        {/* Challenge prompt */}
        <h1 className="text-4xl font-orbitron font-bold text-center mb-4">
          {t("title", { name })}
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          {t("prompt")}
        </p>

        {/* Registration form */}
        <RegistrationForm locale={locale} translations={...} />
      </div>
    </main>
  );
}
```

**Key behavior:** When user submits the registration form, they see their **own** card reveal (via CardReveal component), not the challenger's card. This is already handled by RegistrationForm's success state from Phase 5.

### Anti-Patterns to Avoid

- **Using database lookups for challenge cards:** Phase 6 cards must be deterministic from name alone, not fetched from DB
- **Different agent numbers on each visit:** Must use a consistent placeholder like "SPEC-????" or hash-based number
- **Trying to use CSS Grid in ImageResponse:** Satori only supports flexbox
- **Loading fonts at runtime in ImageResponse:** Must load font files asynchronously before rendering
- **Using Tailwind classes in ImageResponse:** Satori doesn't process Tailwind; use inline styles only

## What Exists in Codebase vs What Needs Building

### card-utils.ts — Gap Analysis

| Feature | Exists | Needs | Action |
|---------|--------|-------|--------|
| `hashStr()` | ✅ Yes | - | Use as-is |
| `generateCardGradient()` | ✅ Yes | - | Use as-is |
| `getDeterministicBuilderClass()` | ✅ Yes | - | Use as-is |
| `generateDeterministicCard()` | ❌ No | Full function | Add |
| `PLACEHOLDER_AGENT_PREFIX` | ❌ No | Constant for "SPEC-????" | Add |

**Implementation plan:**
```typescript
// card-utils.ts (extend)
const PLACEHOLDER_AGENT_NUMBER = "SPEC-????";

export function generateDeterministicCard(name: string): CardData {
  return {
    agentNumber: PLACEHOLDER_AGENT_NUMBER,
    name: name,
    city: "Virtual",
    track: "virtual" as const,
    builderClass: getDeterministicBuilderClass(name),
    gradient: generateCardGradient(name),
  };
}
```

### Routing Structure — Current vs Needed

**Current routes:**
```
app/
  [locale]/
    page.tsx         # Home page
    layout.tsx       # Locale layout
    not-found.tsx    # 404 handler
```

**Needed additions:**
```
app/
  [locale]/
    c/
      [name]/
        page.tsx               # NEW: Challenge page
        opengraph-image.tsx    # NEW: Dynamic OG image
```

### Translation Files — Current vs Needed

**Current namespaces in `en.json`/`es.json`:**
- `navbar`, `hero`, `manifesto`, `phases`, `judging`, `hubs`, `sponsors`, `faq`, `footer`, `NotFound`, `metadata`, `cards`

**Needed additions:**
New `"challenge"` namespace with keys:
- `title`: "[Name] challenges you to join SpecHack"
- `prompt`: "Do you accept the challenge? Register and get your own trading card."
- `registerCta`: "Accept Challenge"
- `metaTitle`: "Join {name} at SpecHack 2026"
- `metaDescription`: "{name} challenges you to join SpecHack 2026 — 10 days, one global hackathon. Register and get your trading card."

### Component Reuse from Phase 5

**Can reuse directly:**
- `TradingCard.tsx` — Shows challenger's card on challenge page
- `RegistrationForm.tsx` — Registration form already handles success state correctly
- `CardReveal.tsx` — User sees their own card after registration (not challenger's)

**Need to create new:**
- `OGCardLayout.tsx` — Satori-compatible card renderer for ImageResponse

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG image generation | Custom image server with Puppeteer/Playwright | Next.js ImageResponse | Built-in, edge-optimized, no server cost |
| Dynamic route locale handling | Custom middleware logic | next-intl with nested `[locale]/c/[name]` | Already configured, handles locale negotiation |
| Deterministic randomness | Custom PRNG library (seedrandom, Prando) | Simple hash-based selection from arrays | Existing `hashStr()` is sufficient for builder class and gradient selection |
| Font loading for OG images | CDN font URLs | Local font files in `public/fonts/` | More reliable, no external dependency |

## Common Pitfalls

### Pitfall 1: ImageResponse Runtime Environment
**What goes wrong:** ImageResponse throws errors about missing APIs or modules.
**Why it happens:** ImageResponse requires Edge Runtime, not Node.js runtime.
**How to avoid:** Always export `export const runtime = "edge";` in `opengraph-image.tsx` files.
**Warning signs:** Build errors about `fs` module or Node.js APIs not being available.

### Pitfall 2: Satori CSS Limitations
**What goes wrong:** OG images render incorrectly or throw errors about unsupported CSS.
**Why it happens:** Satori only supports flexbox and a subset of CSS properties.
**How to avoid:** Use only inline styles with flexbox layouts. Avoid `display: grid`, `calc()`, CSS variables, `transform`, `animation`, advanced selectors.
**Warning signs:** OG images are blank or layout is broken.

### Pitfall 3: Font Loading in Edge Runtime
**What goes wrong:** Custom fonts don't load in ImageResponse.
**Why it happens:** Edge Runtime can't use `fs` to read local files. Must use `fetch()` with absolute URLs or `new URL()` import.
**How to avoid:** Store fonts in `public/fonts/` and fetch via `new URL("@/public/fonts/Font.ttf", import.meta.url)` or use Google Fonts URLs.
**Warning signs:** OG images show fallback fonts instead of Orbitron/JetBrains Mono.

### Pitfall 4: Locale Param Not Passed to opengraph-image.tsx
**What goes wrong:** OG images always render in one language regardless of URL locale.
**Why it happens:** `opengraph-image.tsx` receives `params` but must extract locale separately.
**How to avoid:** `opengraph-image.tsx` receives `{ locale, name }` in params. Pass locale to card renderer for translated text.
**Warning signs:** All OG images show English builder class descriptions even for `/es/c/...` URLs.

### Pitfall 5: Challenge Name URL Encoding
**What goes wrong:** Challenge links break for names with spaces or special characters.
**Why it happens:** URLs can't contain raw spaces. Current `buildChallengeLink()` uses `.split(" ")[0]` but doesn't encode.
**How to avoid:** Use `encodeURIComponent()` when building URLs. Or normalize names to lowercase alphanumeric slugs.
**Warning signs:** URLs like `/c/María José` cause 404s or decode incorrectly.

### Pitfall 6: Database Lookups on Challenge Pages
**What goes wrong:** Challenge pages try to fetch participant records that don't exist yet.
**Why it happens:** Developer assumes challenge names are registered users.
**How to avoid:** Challenge pages use `generateDeterministicCard()` only. No database queries. Users register via the form, creating DB records then.
**Warning signs:** 404s or errors when visiting `/c/UnknownName`.

### Pitfall 7: OG Image Caching Issues
**What goes wrong:** OG images don't update when testing changes.
**Why it happens:** Next.js caches generated images. Social media platforms cache OG images aggressively.
**How to avoid:** During development, use unique URLs or query params. For production, images are deterministic so caching is desired.
**Warning signs:** Old OG images persist after code changes.

### Pitfall 8: Missing generateMetadata for Challenge Pages
**What goes wrong:** Challenge pages don't show dynamic OG images on social media.
**Why it happens:** `opengraph-image.tsx` generates the image, but `page.tsx` must include proper metadata pointing to it.
**How to avoid:** Export `generateMetadata()` in `page.tsx` with `openGraph` config. Next.js automatically links to `opengraph-image.tsx` when both exist.
**Warning signs:** Social media previews show default site OG image instead of challenge-specific cards.

## Technical Implementation Details

### 1. Dynamic Route Structure

**File:** `app/[locale]/c/[name]/page.tsx`

```typescript
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { TradingCard } from "../../_components/TradingCard";
import { RegistrationForm } from "../../_components/RegistrationForm";
import { generateDeterministicCard } from "@/lib/card-utils";

type Props = {
  params: Promise<{ locale: string; name: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, name } = await params;
  const t = await getTranslations({ locale, namespace: "challenge" });

  return {
    title: t("metaTitle", { name }),
    description: t("metaDescription", { name }),
    openGraph: {
      title: t("metaTitle", { name }),
      description: t("metaDescription", { name }),
      // opengraph-image.tsx in same directory is auto-detected
    },
  };
}

export default async function ChallengePage({ params }: Props) {
  const { locale, name } = await params;
  setRequestLocale(locale);

  // Decode URL-encoded name
  const decodedName = decodeURIComponent(name);
  const challengerCard = generateDeterministicCard(decodedName);

  const t = await getTranslations("challenge");
  const heroT = await getTranslations("hero");
  const cardT = await getTranslations("cards");

  return (
    <main className="min-h-screen py-24 px-4 blueprint-grid">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Challenger card preview */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-[200px] sm:w-[240px]">
            <TradingCard card={challengerCard} locale={locale as "es" | "en"} />
          </div>

          <div className="text-center space-y-4">
            <h1 className="font-orbitron text-3xl sm:text-5xl font-extrabold">
              {t("title", { name: decodedName })}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t("prompt")}
            </p>
          </div>
        </div>

        {/* Registration form */}
        <div className="max-w-xl mx-auto">
          <RegistrationForm
            locale={locale as "es" | "en"}
            translations={{
              formTitle: heroT("formTitle"),
              formName: heroT("formName"),
              formEmail: heroT("formEmail"),
              formCity: heroT("formCity"),
              trackVirtual: heroT("trackVirtual"),
              trackHub: heroT("trackHub"),
              trackVirtualHelper: heroT("trackVirtualHelper"),
              trackHubHelper: heroT("trackHubHelper"),
              submit: t("registerCta"),
              formNote: heroT("formNote"),
              successTitle: heroT("successTitle"),
              successSub: heroT("successSub"),
            }}
            cardTranslations={{
              download: cardT("download"),
              shareX: cardT("shareX"),
              challenge: cardT("challenge"),
              challengeCopy: cardT("challengeCopy"),
              challengeWhatsApp: cardT("challengeWhatsApp"),
              challengeLinkedIn: cardT("challengeLinkedIn"),
              recruitMore: cardT("recruitMore"),
              tweetTemplate: cardT("tweetTemplate"),
            }}
          />
        </div>
      </div>
    </main>
  );
}
```

### 2. Dynamic OG Image Generation

**File:** `app/[locale]/c/[name]/opengraph-image.tsx`

```typescript
import { ImageResponse } from "next/og";
import { generateDeterministicCard } from "@/lib/card-utils";

export const runtime = "edge";
export const alt = "SpecHack Challenge Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string; name: string }>;
};

export default async function Image({ params }: Props) {
  const { locale, name } = await params;
  const decodedName = decodeURIComponent(name);
  const card = generateDeterministicCard(decodedName);

  // Load custom fonts (local files or Google Fonts URLs)
  const [orbitronBold, jetbrainsMonoReg] = await Promise.all([
    fetch(new URL("../../../../public/fonts/Orbitron-Bold.ttf", import.meta.url))
      .then((res) => res.arrayBuffer()),
    fetch(new URL("../../../../public/fonts/JetBrainsMono-Regular.ttf", import.meta.url))
      .then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: `linear-gradient(${card.gradient.angle}deg, ${card.gradient.from}20, ${card.gradient.to}20), hsl(240,10%,7%)`,
          padding: 60,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top section */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, fontFamily: "JetBrains Mono", color: "hsl(240,5%,50%)" }}>
            SPECHACK 2026
          </div>
          <div
            style={{
              fontSize: 72,
              fontFamily: "Orbitron",
              fontWeight: 700,
              color: "white",
              marginTop: 20,
            }}
          >
            {card.name}
          </div>
          <div
            style={{
              fontSize: 48,
              fontFamily: "JetBrains Mono",
              color: card.gradient.from,
              marginTop: 10,
            }}
          >
            {card.agentNumber}
          </div>
        </div>

        {/* Bottom section */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 40,
              fontFamily: "Orbitron",
              fontWeight: 700,
              color: card.gradient.to,
            }}
          >
            {card.builderClass.name}
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: "JetBrains Mono",
              color: "hsl(240,5%,60%)",
              marginTop: 10,
            }}
          >
            {card.builderClass.desc[locale as "es" | "en"]}
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: "JetBrains Mono",
              color: "hsl(240,5%,40%)",
              marginTop: 40,
            }}
          >
            Join the challenge · June 19-28, 2026
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Orbitron", data: orbitronBold, weight: 700, style: "normal" },
        { name: "JetBrains Mono", data: jetbrainsMonoReg, weight: 400, style: "normal" },
      ],
    }
  );
}
```

**Important notes:**
- Font files must exist at `public/fonts/Orbitron-Bold.ttf` and `public/fonts/JetBrainsMono-Regular.ttf`
- If fonts aren't in public folder, download from Google Fonts or use fetch from Google Fonts CDN URLs
- The layout uses only flexbox and inline styles (Satori requirement)
- `locale` is passed through params to render builder class description in correct language

### 3. Deterministic Card Generation Extension

**File:** `src/lib/card-utils.ts` (extend existing)

```typescript
// Add to existing card-utils.ts

export const PLACEHOLDER_AGENT_NUMBER = "SPEC-????";

/**
 * Generate a deterministic trading card from a name alone (for challenge pages).
 * Does not require database lookup. Always produces same card for same name.
 */
export function generateDeterministicCard(name: string): CardData {
  // Capitalize first letter of each word for display
  const displayName = name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return {
    agentNumber: PLACEHOLDER_AGENT_NUMBER,
    name: displayName,
    city: "Virtual",
    track: "virtual" as const,
    builderClass: getDeterministicBuilderClass(displayName),
    gradient: generateCardGradient(displayName),
  };
}
```

**Alternative with hash-based agent number:**
```typescript
export function generateDeterministicCard(name: string): CardData {
  const displayName = name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Generate deterministic 4-digit agent number from hash
  const hash = hashStr(displayName);
  const agentNum = (hash % 9000) + 1000; // Range: 1000-9999

  return {
    agentNumber: `SPEC-${agentNum.toString()}`,
    name: displayName,
    city: "Virtual",
    track: "virtual" as const,
    builderClass: getDeterministicBuilderClass(displayName),
    gradient: generateCardGradient(displayName),
  };
}
```

**Recommendation:** Use hash-based agent number. This creates consistent, believable agent numbers for challenge cards without database lookups. If user later registers, they get a real sequential number, but the challenge page preview looks complete.

### 4. Translation Additions

**File:** `messages/en.json` (extend)

```json
{
  "challenge": {
    "title": "{name} challenges you to join SpecHack",
    "prompt": "Do you accept the challenge? Register and get your own trading card.",
    "registerCta": "Accept Challenge",
    "metaTitle": "Join {name} at SpecHack 2026",
    "metaDescription": "{name} challenges you to join SpecHack 2026 — 10 days, one global hackathon. Register and get your trading card."
  }
}
```

**File:** `messages/es.json` (extend)

```json
{
  "challenge": {
    "title": "{name} te desafía a unirte a SpecHack",
    "prompt": "¿Aceptas el desafío? Regístrate y obtén tu propia tarjeta.",
    "registerCta": "Aceptar Desafío",
    "metaTitle": "Únete a {name} en SpecHack 2026",
    "metaDescription": "{name} te desafía a unirte a SpecHack 2026 — 10 días, un hackathon global. Regístrate y obtén tu tarjeta."
  }
}
```

## Integration Points

### 1. Share Utils — Challenge Link Generation

**Current implementation:**
```typescript
// share-utils.ts
export function buildChallengeLink(name: string, origin: string): string {
  return `${origin}/c/${name.split(" ")[0].toLowerCase()}`;
}
```

**Issue:** This doesn't include locale prefix and doesn't encode spaces.

**Recommended update:**
```typescript
export function buildChallengeLink(
  name: string,
  origin: string,
  locale: "es" | "en"
): string {
  // Use first word only, lowercase, URL-encoded
  const slug = encodeURIComponent(name.split(" ")[0].toLowerCase());
  return `${origin}/${locale}/c/${slug}`;
}
```

**Affected files:** `CardReveal.tsx` — Update all calls to `buildChallengeLink()` to pass `locale` param.

### 2. Font Files Setup

**Requirement:** OG image generation needs TTF/OTF font files for Orbitron and JetBrains Mono.

**Options:**
1. **Download to `public/fonts/`:**
   - Orbitron-Bold.ttf from Google Fonts
   - JetBrainsMono-Regular.ttf from Google Fonts
   - Reference via `new URL("../../../../public/fonts/Font.ttf", import.meta.url)`

2. **Fetch from Google Fonts CDN:**
   - `https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap`
   - Parse CSS to get TTF URL, fetch that
   - More complex but no local files needed

**Recommendation:** Download fonts to `public/fonts/` for reliability and performance.

### 3. Navbar — Challenge Link

**Current:** Navbar has `challenge`, `howItWorks`, `prizes`, etc. links.

**Possible addition:** Link "challenge" to `/[locale]/c/example` as a demo? Or keep as anchor to `#challenge` section?

**Recommendation:** Keep navbar as-is. Challenge pages are only discovered via shared links, not site navigation.

## Suggested Plan Breakdown

### Plan 06-01: Deterministic Card Generation & Translations
- Extend `card-utils.ts` with `generateDeterministicCard()` and `PLACEHOLDER_AGENT_NUMBER`
- Add `"challenge"` namespace to `en.json` and `es.json`
- Update `buildChallengeLink()` in `share-utils.ts` to include locale param
- Update `CardReveal.tsx` to pass locale to `buildChallengeLink()`
- Test: Verify same name produces same gradient, builder class, and agent number

### Plan 06-02: Challenge Page Route
- Create `app/[locale]/c/[name]/page.tsx`
- Implement challenge page layout (card preview + prompt + registration form)
- Export `generateMetadata()` for dynamic title/description
- Test: Visit `/es/c/Maria` and `/en/c/John` — verify deterministic cards display
- Test: Submit registration on challenge page — verify user's own card shows (not challenger's)

### Plan 06-03: Dynamic OG Image Route
- Download Orbitron-Bold.ttf and JetBrainsMono-Regular.ttf to `public/fonts/`
- Create `app/[locale]/c/[name]/opengraph-image.tsx`
- Implement ImageResponse with Satori-compatible flexbox layout
- Load custom fonts using `fetch()` + `new URL()`
- Export `runtime = "edge"`, `size`, `contentType`, `alt`
- Test: Visit `/es/c/Maria/opengraph-image` directly — verify PNG renders correctly
- Test: Share challenge link on X/WhatsApp — verify OG image shows in preview

## Open Questions

1. **Agent number display strategy**
   - What we know: Challenge pages need deterministic agent numbers
   - What's unclear: Use placeholder "SPEC-????" or hash-based "SPEC-1234"?
   - Recommendation: Hash-based for better UX — looks more complete and is still deterministic

2. **Name normalization for URLs**
   - What we know: `buildChallengeLink()` currently uses first name only
   - What's unclear: How to handle multi-word names, special characters, capitalization?
   - Recommendation: Use first word, lowercase, URL-encoded. Accept that "María José" becomes `/c/mar%C3%ADa`

3. **Font file licensing**
   - What we know: Orbitron and JetBrains Mono are from Google Fonts
   - What's unclear: Can we bundle TTF files in `public/` or must fetch from CDN?
   - Recommendation: Both fonts are open source (OFL). Bundling is allowed and recommended for reliability.

4. **Locale in opengraph-image.tsx**
   - What we know: OG image needs locale for builder class descriptions
   - What's unclear: Is locale automatically included in params for `opengraph-image.tsx`?
   - Research result: Yes, `opengraph-image.tsx` receives same params as `page.tsx` including `{ locale, name }`

5. **404 handling for invalid challenge names**
   - What we know: Challenge pages are deterministic from any name string
   - What's unclear: Should we validate names or allow any string?
   - Recommendation: Allow any string — challenge pages are just invitations, not user profiles

## Sources

### Primary (HIGH confidence)
- Existing codebase: `apps/spechack/src/` — card utilities, routing structure, registration flow
- Phase 5 research: `.planning/phases/05-trading-cards/05-RESEARCH.md` — card generation patterns
- Database schema: `packages/database/src/schema.ts` — participant table structure

### Secondary (MEDIUM-HIGH confidence)
- [Next.js ImageResponse API Reference](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [Next.js Dynamic OG Image Generation Guide](https://makerkit.dev/blog/tutorials/dynamic-og-image)
- [Vercel OG Image Generation Documentation](https://vercel.com/docs/og-image-generation)
- [Using Custom Fonts in OG Images](https://vercel.com/guides/using-custom-font)
- [next-intl Routing Documentation](https://next-intl.dev/docs/routing)
- [Next.js 15 App Router Internationalization Guide](https://medium.com/@thomasaugot/next-js-15-app-router-internationalization-with-url-based-routing-7e49413dc7c1)

### Tertiary (MEDIUM confidence)
- [Deterministic PRNG in JavaScript (seedrandom)](https://github.com/davidbau/seedrandom)
- [Simple Seeded Random Generator Patterns](https://gist.github.com/blixt/f17b47c62508be59987b)
- [Satori GitHub Repository](https://github.com/vercel/satori) — Understanding CSS limitations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — No new dependencies needed, ImageResponse is built-in
- Architecture: HIGH — Clear nested route pattern, Phase 5 components reusable
- Deterministic generation: HIGH — Existing `hashStr()` provides foundation
- OG image implementation: MEDIUM-HIGH — Satori has CSS limitations, font loading requires testing
- Integration: HIGH — Minimal changes to existing code, well-isolated new routes

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (stable — Next.js 16 OG image API is mature)

# 404 Mapped — Implementation

**"Deeptech, finally in scope."**

This document contains every architectural, behavioral, and UX decision made during the planning phase. It is the single source of truth for **what to build and how it behaves**. The design spec (`design-spec.jsonc`) is the single source of truth for **how it looks** — colors, typography, spacing, animations, and all visual tokens. Read both files fully before writing any code.

---

## 1. What This Is

A bilingual (ES/EN) web platform by 404 Tech Found (404tf) that serves as:
- A curated directory of 100+ deeptech startups across Latin America
- A two-sided open innovation engine connecting corporates/government with deeptech solutions
- A credibility-building analytics platform on the deeptech ecosystem

404tf monetizes by sitting in the middle: corporates find startups through the platform, 404tf facilitates the connection and charges for consulting + pilot facilitation.

---

## 2. Tech Stack

- **Framework:** Astro (SSR mode on Vercel for API routes)
- **Runtime:** Bun
- **Monorepo:** Bun workspaces. This app lives alongside other apps. Some shared packages exist.
- **Database:** Drizzle ORM + Neon Postgres (shared `packages/database`)
- **Styling:** Tailwind CSS with CSS variables derived from the design spec
- **UI components:** React islands for interactive elements (map, filters, forms, modals). Static Astro components for everything else.
- **Hosting:** Vercel (free tier)
- **Images:** Stored in repo for v1 (public/images/startups/[slug]/)
- **i18n:** Astro's built-in i18n routing (/es/..., /en/...)
- **Charts:** Recharts (React, used inside Astro islands)
- **Backend:** Astro API routes (no extra framework). Drizzle + Zod validation + Resend for email notifications.
- **Notifications:** Resend (email to 404tf team on every lead submission)
- **Analytics:** PostHog (page views, funnel tracking, form submission events)
- **Validation:** Zod (server-side on API routes, client-side on forms)

---

## 3. Site Architecture

### 5 public pages + 1 support page + 1 modal component

| # | Page | Route (EN / ES) | Render Strategy |
|---|------|-----------------|----------------|
| 1 | Home / Landing | /en, /es | Static (prerendered) |
| 2 | Directory | /en/directory, /es/directorio | Static with client-side filtering (React island) |
| 3 | Startup Profile | /en/startup/[slug], /es/startup/[slug] | Static (prerendered, one per startup) |
| 4 | Insights | /en/insights, /es/perspectivas | Static (prerendered) |
| 5 | For Startups | /en/startups, /es/startups | Static with form islands |
| 6 | About / Methodology | /en/about, /es/nosotros | Static (prerendered) |
| -- | Corporate Modal | (component, not a page) | React island, triggered from any page |

### Navigation

Main nav (fixed top): **Directory | Insights | For Startups** + 404 Mapped logo (home) + language toggle (ES/EN)

About/Methodology lives in footer nav only, not main nav.

---

## 4. Design System

All visual tokens live in `design-spec.jsonc`. That file is the single source of truth for:
- Colors, backgrounds, text levels, accents, vertical palette, semantic colors, gradients
- Typography (font families, scale, weights, roles)
- Spacing, border radius, shadows/elevation
- Component tokens (cards, inputs, buttons, tags, tooltips, tables, nav, skeletons)
- Animation (easing, durations, entrance patterns)
- Map tokens (dot sizes, clustering, zoom, legend)
- Chart tokens (axes, grids, tooltips, annotations, series colors)
- Breakpoints and z-index scale

### Critical design rules:
- Dark theme throughout.
- NEVER use Inter, Roboto, Arial, or system fonts. Use the fonts specified in the design spec.
- NEVER use purple gradients on white backgrounds. This is the stereotypical AI-generated look we're explicitly avoiding.
- Data-forward aesthetic: numbers, charts, and visualizations are prominent, not decorative.
- The feel splits the difference between a research report and a modern SaaS directory.
- Use CSS variables for all tokens. Define them in a global stylesheet derived from the design spec.

### Frontend design skill
Use `/frontend-design` for every component that produces visual output. This skill forces bold aesthetic choices and avoids generic AI slop.

---

## 5. Data Model

### Core entity: Startup

```
startups table:
  id                 serial PRIMARY KEY
  slug               text UNIQUE NOT NULL (auto-generated from name, URL-safe)
  name               text NOT NULL
  one_liner          text
  country            text NOT NULL
  city               text NOT NULL
  lat                float
  lng                float
  verticals          text[] (array of vertical enum values)
  maturity_level     text (enum: 'rd', 'prototype', 'pilot', 'revenue')
  founding_year      integer
  tech_description   text
  key_results        jsonb (array of {type, title, description, partner?})
  problem_statement  text
  business_model     text
  funding_received   text (free text, e.g. "$4.2M Seed")
  team_size          integer
  website_url        text
  social_links       jsonb (e.g. {linkedin: "...", twitter: "...", github: "..."})
  logo_path          text (relative path in repo: /images/startups/[slug]/logo.png)
  hero_image_path    text (relative path)
  founder_photos     jsonb (array of {image_path, name, role, linkedin_url}, max 3)
  partner_logos      text[] (array of image paths, max 6)
  video_url          text (YouTube/Vimeo/Loom URL, optional)
  video_label        text (e.g. "Watch: NovaBio's enzyme technology explained")

  -- Hidden fields (not displayed publicly)
  contact_name       text
  contact_role       text
  contact_email      text
  contact_phone      text
  contact_linkedin   text
  support_needed     text

  -- Claim/edit status
  claimed            boolean DEFAULT false
  claimed_by_email   text
  claim_approved     boolean DEFAULT false
  last_edited_at     timestamp
  edit_status        text (enum: 'published', 'pending_review', 'changes_requested')

  -- Metadata
  created_at         timestamp DEFAULT now()
  updated_at         timestamp DEFAULT now()

  -- i18n (Spanish versions of text fields)
  one_liner_es       text
  tech_description_es text
  key_results_es     jsonb
  problem_statement_es text
  business_model_es  text
```

### Vertical taxonomy (used as enum/reference)

```
verticals:
  - ai_ml              "AI / Machine Learning"           "IA / Aprendizaje Automatico"
  - biotech            "Biotechnology / Synthetic Bio"    "Biotecnologia / Biologia Sintetica"
  - hardware_robotics  "Hardware / Robotics / IoT"        "Hardware / Robotica / IoT"
  - cleantech          "Cleantech / Climate / Energy"     "Cleantech / Clima / Energia"
  - agritech           "Agritech / Food Tech"             "Agritech / Food Tech"
  - healthtech         "MedDevices / HealthTech"          "Dispositivos Medicos / HealthTech"
  - advanced_materials "Advanced Materials / Nano"         "Materiales Avanzados / Nano"
  - aerospace          "Aerospace / Space Tech"           "Aeroespacial / Space Tech"
  - quantum            "Quantum Computing"                "Computación Cuántica"
  - other              "Other"                            "Otro"
```

> **Decision (2026-03-25):** Removed "Blockchain / Web3" and "Fintech" from taxonomy. Neither is deeptech — including them dilutes the scientific rigor positioning. Startups combining blockchain with deeptech (e.g., quantum-safe cryptography) classify under their primary deeptech vertical. 9 verticals total.

Each vertical has an assigned color in the design spec.

### Seeding strategy

For launch, seed profiles with data gathered during the data recopilation phase:
- name, slug, country, city, lat/lng, verticals, founding_year, one_liner, website_url
- tech_description, key_results, problem_statement, business_model, funding_received populated where available
- Image fields populated in a separate images step after data recopilation
- Startups can further enrich their profiles via the claim flow

Create a seed file (JSON or SQL) with initial data. At build time, query the database and generate static pages for each startup.

---

## 6. Page Specifications

### 6.1 Home / Landing Page

**Purpose:** First impression. Impress, orient, convert.

**Sections in scroll order:**

1. **Nav bar** (fixed, semi-transparent, backdrop blur)
   - Left: 404 Mapped logo
   - Center/right: Directory | Insights | For Startups
   - Far right: ES | EN toggle
   - On scroll: solid background + subtle bottom border
   - Mobile: hamburger menu

2. **Hero** (full viewport height)
   - DOT-GRID MAP as dominant visual:
     - Grid of small circles covering viewport at low opacity (background shimmer)
     - Dots within Americas landmass outline at higher opacity (creates continent shape)
     - LATAM region dots at even higher opacity (highlights focus area)
     - Startup dots: larger, colored by vertical, soft glow
     - The continent is MADE OF dots. Not dots floating on empty space.
     - Ambient animation: background dots pulse slowly with staggered timing. Startup dots breathe (glow expands/contracts).
   - Text overlay (top-left on desktop, centered on mobile):
     - "404 Mapped" display font, large
     - "Deeptech, finally in scope." subtitle
     - Secondary line: "100+ startups building deep technology across Latin America"
     - Gradient backing behind text for readability
   - Stats bar: "100+ Startups | 12 Countries | 11 Verticals | $187M Raised"
     - Numbers count up from 0 on page load
   - Dual CTAs:
     - Primary (filled): "Find Your Deeptech Solution" -> triggers corporate modal
     - Secondary (outlined): "Get on the Map ->" -> /startups
     - Primary must be visually dominant
   - Scroll indicator: thin chevron with gentle bounce, disappears on first scroll

   DO NOT include on the hero: vertical filter panel, hover tooltips, click handlers on dots, clustering. That's Directory page functionality.

3. **Featured Startups** ("On the Map")
   - Section label: small, uppercase, letter-spaced
   - Headline: "100+ startups. 12 countries. Every deeptech vertical."
   - 6 startup cards (2x3 grid), diverse countries/verticals/maturity
   - "Explore the full directory ->" link
   - Stagger-in animation on scroll

4. **Data Preview** ("Key Findings")
   - Two columns:
     - Left: geographic distribution bar chart (top 5 countries, simplified)
     - Right: three key stats stacked vertically (e.g. "35% at Pilot+", "42% bootstrapped", "AI/ML and Biotech lead at 42%")
   - "See all insights ->" link
   - Teaser: make the reader want more data

5. **Dual Conversion** ("How 404 Mapped Works")
   - Different background shade to separate
   - Two cards side by side:
     - Left (FOR CORPORATES, visually dominant): "Discover deeptech for your challenges" + 3 steps + CTA triggers corporate modal
     - Right (FOR STARTUPS, secondary): "Get in front of enterprise buyers" + 2 steps + CTA links to /startups
   - Corporate card must be visually larger/brighter

6. **Footer**
   - Three columns: 404 Mapped info + social | Nav links (including About) | Contact
   - Bottom bar: (c) 2026 404 Tech Found | ES | EN
   - Compact, not a conversion tool

**Animations:** Hero loads immediately. All other sections fade in + translate up on scroll (Intersection Observer). Children stagger in. Each section animates once. No parallax. No scroll hijacking.

**Responsive:** Tablet: 2-col grids stay. Mobile: everything single column, nav becomes hamburger, stats bar wraps 2x2, hero text smaller but readable.

---

### 6.2 Directory Page

**Purpose:** Primary discovery interface. Where corporates, VCs, and others browse and filter startups.

**Two synchronized views: interactive map (top) + filterable card grid (below).**

1. **Map Panel** (collapsible, ~40vh default, toggle/drag to collapse or expand)
   - Same dot-grid aesthetic as hero BUT fully interactive
   - Startup dots colored by vertical
   - Hover: mini tooltip (name, vertical pill, one-liner)
   - Click dot: scroll to and highlight corresponding card in grid
   - Click country region: filter grid to that country
   - When grid filters active: non-matching dots fade to low opacity (don't disappear)
   - ~~Dot clusters: numbered cluster when 3+ overlap, click to fan out~~ DEFERRED — complexity vs value is bad
   - Subtle country labels for each LATAM country

> **Decision (2026-03-25):** Full custom dot-grid (Option A) for both hero and directory. The dot-grid IS the product story — a continent made of dots communicates the ecosystem mapping instantly. Directory map keeps hover tooltips, click-to-card, country-click-to-filter. Cut: dot clustering, drag-to-resize panel. Mobile: map collapses with "View map" toggle — don't force touch on dots.

2. **Filter Bar** (sticky below map when scrolling)
   - Search input: full width, prominent, placeholder "Search by name, technology, or problem..."
     Debounced 300ms, searches across name, one_liner, verticals
   - Vertical chips: horizontal scrollable, colored dots matching vertical palette, click to toggle, multi-select, active = filled
   - Dropdowns: Country, Maturity Level, Funding Stage
   - Active filters: dismissible pills + "Clear all" (hidden when no filters)
   - "Showing X of 100+" counter + sort dropdown (Relevance, Newest, Most Funded, A-Z)

3. **Card Grid** (3 col desktop, 2 tablet, 1 mobile)
   - Each card: logo placeholder (colored initials) | name | one-liner (2 lines, truncate) | flag + location | vertical pills (max 2 + "+N") | maturity badge | funding | arrow icon
   - Hover: subtle lift + border shifts to vertical color + shadow
   - Click: navigate to /startup/[slug]
   - Filter animations: exit (fade out + scale down), enter (fade in + scale up, staggered)
   - Empty state: "No startups match your filters" + "Try broadening your search" + "Clear all filters" button

4. **Floating Corporate CTA** (fixed bottom-right, or slim bottom bar on mobile)
   - "Find Your Deeptech Solution ->" triggers corporate modal

**Implementation note:** All startup data loads at build time into a JSON blob embedded in the page. Filtering is 100% client-side (React island). No API calls for filtering.

---

### 6.3 Startup Profile Page

**Purpose:** Deep evaluation page. A corporate user decides here whether to click "Talk to 404tf."

**Route:** /en/startup/[slug], /es/startup/[slug] — prerendered at build time for all startups.

**Layout:**

1. **Breadcrumb:** Directory > [Startup Name]

2. **Hero Section**
   - Left (60%): logo + name (display font) + one-liner + metadata row (flag + location, founded, maturity badge, team size, funding) + vertical tags
   - Right (40%): hero_image in rounded container with vertical-colored border. If no image: styled placeholder with vertical icon + gradient bg.

3. **Leadership** (only renders if founder_photos exist)
   - Horizontal row of 1-3 circular headshots + name + role + LinkedIn icon

4. **Technology**
   - Full tech description, generous spacing
   - If video_url exists: styled card with auto-thumbnail + play overlay + label
   - Optional: pull out a key metric as a callout block

5. **Key Results**
   - Each result as a card with icon prefix (patent icon, handshake for pilots, document for publications, trophy for achievements)
   - Pilot cards show partner logos inline if partner_logos exist
   - Corporate partner names prominent (social proof)

6. **The Problem**
   - Problem statement text
   - Key stat as accent-bordered callout block

7. **Business Model**
   - Description
   - "First pilot is free" (or equivalent) as highlighted callout if applicable

8. **Related Startups** ("More in [Primary Vertical]")
   - 3 cards from same vertical, horizontally scrollable on mobile

9. **Claim CTA** (very bottom, subtle)
   - "Are you part of [Name]?" + "Claim this profile ->"

**Conversion sidebar** (desktop: right column 280px, sticky. Mobile: sticky bottom bar):
   - "Need a solution like this?"
   - 404tf pitch + 3-step process (Understand -> Analyze -> Pilot)
   - "Talk to 404tf" button -> triggers corporate modal
   - "Or explore similar startups below"

**Handling empty fields:** When a field is null (common for profiles pending enrichment), collapse that section entirely. Don't show empty headers or placeholder text. If most fields are empty, show a minimal profile (name, location, vertical, founding year) with a prominent "This profile is being completed by the startup team" message and the claim CTA.

---

### 6.4 Insights Page

**Purpose:** Establish 404 Mapped credibility + capture leads via gated PDF.

**This is an editorial data story, NOT a dashboard.** Think annual report from a consulting firm meets data journalism. Every chart is deliberately composed. All data is static — computed during the analysis phase and baked into the page at build time.

**Sections:**

1. **Header**
   - "The State of Deeptech" (display font, very large)
   - "An analysis of 100+ startups building deep technology across Latin America. First edition, 2026."
   - "A 404 Mapped report"

2. **Executive Summary** — 3 stat callouts:
   "100+ Startups" | "12 Countries" | "$187M Total Funding Raised"

3. **Geographic Distribution** — "Where is deeptech?"
   - Horizontal bar chart. Data computed during analysis phase.
   - Flag emoji labels. Values at bar end. No gridlines. Bars animate on scroll.
   - Insight callout with key finding.
   - CLICKABLE: each bar links to /directory?country=[value]

4. **Vertical Breakdown** — "What are they building?"
   - Treemap or thick stacked bar (NOT pie chart). Use vertical color palette.
   - Data computed during analysis phase.
   - Insight callout.
   - CLICKABLE: each segment links to /directory?vertical=[value]

5. **Founding Year Timeline** — "When did they start?"
   - Area chart. Gradient fill. Data computed during analysis phase.
   - Insight callout.

6. **Maturity Distribution** — "How mature are they?"
   - Segmented progress bar (4 horizontal blocks). R&D / Prototype / Pilot / Revenue.
   - Insight callout.

7. **Funding Landscape** — "Follow the money"
   - Three stat callouts: total raised, % bootstrapped, avg seed.
   - Grouped bar chart by funding range.

8. **PDF Download Gate**
   - Elevated card.
   - "Download the Full Report" + trust signal "First edition, 2026"
   - Inline form: Name + Email (single row) + submit button.
   - Both required. Inline validation. Email format check.
   > **Decision (2026-03-25):** Reduced from 4 fields to 2 (name + email). Each extra field drops conversion ~10%. Organization/role are nice-to-have data, not worth the lead loss.
   - On submit: store lead in database, send notification via Resend, trigger download.
   - Privacy note below form.

9. **Corporate CTA** — "Looking for a deeptech solution?" + "Talk to 404tf ->" triggers modal.

**Chart design principles:**
- All charts use Recharts (React islands inside Astro)
- No gridlines. No axis lines unless essential. Clean, editorial.
- Charts animate data on first scroll appearance.
- Each chart section has generous padding above and below.
- Section labels: small, uppercase, letter-spaced, muted.
- Insight callouts: left accent border, slight indent, slightly larger body text.

**CRITICAL: Every data point in the insights page should be a link to the directory with the relevant filter applied.** The insights page is a navigation layer for the directory, not a dead-end.

---

### 6.5 For Startups Page

**Purpose:** Both startup conversion paths on a single page.

**Route:** /en/startups, /es/startups

**SECTION 1: GET ON THE MAP**

- Headline: "Get your startup in front of corporates, investors, and the ecosystem"
- Three value props: Visibility, Credibility, Connections (icon + text)
- Who qualifies: short paragraph about deeptech criteria
- Multi-step form (2 steps):
  - Step 1: Startup name, Website URL, Your name, Your role, Email
  - Step 2: Country (dropdown), Primary vertical (dropdown), Maturity level (dropdown), One-liner (textarea, 200 char max with counter), Why should we feature you? (textarea)
- Progress bar, back/next/submit, inline validation
- Success state replaces form: "Application received. We review within 5 business days."
- On submit: store in database, send notification via Resend.

**VISUAL DIVIDER between sections**

**SECTION 2: READY TO SELL TO CORPORATES?**

- Headline: "We help deeptech startups close their first enterprise deals"
- Three tier cards (horizontal desktop, stacked mobile):
  - Assess: sales readiness diagnostic, positioning review, competitive brief
  - Prepare: pitch deck restructuring, value prop dev, pricing guidance, mock proposal
  - Connect: curated intros, meeting facilitation, pilot scope, deal support
- Single form (not multi-step): Startup name, Your name, Email, Which tier? (dropdown: Assess/Prepare/Connect/Not sure), Tell us about your startup (textarea)
- Same success state pattern.
- On submit: store in database, send notification via Resend.

Footer note: "Already featured? Claim your profile to manage your page." with link.

---

### 6.6 About / Methodology (footer nav only)

**Route:** /en/about, /es/nosotros

- About 404tf: 2-3 paragraphs + 2-3 team member cards (photo placeholder, name, role, LinkedIn)
- Methodology: 4-step vertical timeline (Sourced 400+ -> Applied deeptech criteria -> Validated traction -> Selected 100+)
- Collaborators: 6-8 placeholder logo grid
- Soft CTA: "Questions?" + email + "Talk to us" button

---

### 6.7 Corporate Conversion Modal

**This is NOT a page. It's a React component triggered from any corporate CTA across the entire site.**

Trigger points:
- Landing page: "Find Your Deeptech Solution" primary CTA
- Landing page: corporate card in dual conversion section
- Directory: floating CTA
- Startup profile: sidebar "Talk to 404tf" button
- Insights: post-download CTA
- Any contextual "Need a solution like this?" CTA

**Modal behavior:**
- Centered overlay, dark backdrop (click to close)
- Animated entrance (scale + fade)
- Close X top-right

**Content:**
- 404 Mapped logo + "Find Your Deeptech Solution"
- Three-step process bar: Understand -> Analyze -> Pilot (numbered circles, current step highlighted)

**Multi-step form (2 steps):**

Step 1 — "Tell us about you":
Name, Email, Company, Role (dropdown: Innovation Director, CTO/VP Engineering, Procurement, Strategy, Government Official, VC/Investor, Other)

Step 2 — "What are you looking for?":
Industry (dropdown: Mining, Energy, Agriculture, Manufacturing, Financial Services, Healthcare, Logistics, Retail, Telecommunications, Government/Public Sector, Other), Challenge description (textarea, placeholder: "e.g., We need to reduce water usage in our mining operations by 30% within 18 months"), Timeline (dropdown: Exploring, 1-3 months, 3-6, 6-12), Additional notes (optional textarea)

> **Decision (2026-03-25):** Reduced from 3 steps to 2. Step 3 (budget, verticals chips) was conversion friction — corporates don't share budget cold. Fewer fields = more leads. Verticals of interest are inferred from context (which startup/page triggered the modal).

**Success state:** Checkmark animation + "We got your request" + "Our team will review and get back within 2 business days" + "Done" button closes modal.

**Contextual variant:** When triggered from a startup profile page, show "Interested in: [Startup Name]" with vertical pill at top of Step 1. Pass startup slug/name as prop.

On submit: store in database + send notification via Resend to 404tf team.

**Shareable URL fallback:** The modal is the primary UX, but a `/contact` page also exists as a standalone form (same fields, same API endpoint). This allows:
- Bookmarking for later
- Sharing with colleagues ("fill out this form")
- Deep-linking from marketing campaigns (`/en/contact?startup=novabio`)
- Search engine indexing
The modal and the page share the same React form component.

> **Decision (2026-03-25):** Added `/contact` as a shareable page alongside the modal. Modals can't be bookmarked or shared — a procurement director who wants to discuss with their team needs a URL.

### Route addition

| Page | EN | ES |
|------|----|----|
| Contact | /en/contact | /es/contacto |

---

## 7. Data Layer

### Database tables needed:

1. **startups** — Core entity (schema above)
2. **corporate_leads** — Corporate modal form submissions
   - id, name, email, company, role, industry, challenge, timeline, budget_range, verticals_of_interest, notes, context_startup_slug (nullable), created_at
3. **startup_applications** — "Get on the Map" form submissions
   - id, startup_name, website, contact_name, contact_role, email, country, vertical, maturity, one_liner, pitch, created_at, status (enum: new, reviewed, accepted, rejected)
4. **startup_program_inquiries** — "Sell to Corporates" form submissions
   - id, startup_name, contact_name, email, tier_interest, description, created_at, status
5. **report_downloads** — PDF gate form submissions
   - id, name, email, organization, role, created_at

### API endpoints (Astro API routes):

```
POST /api/leads/corporate        — Corporate modal submission
POST /api/leads/startup-apply    — Get on the Map submission
POST /api/leads/startup-program  — Sell to Corporates submission
POST /api/leads/report-download  — PDF download gate
POST /api/startup/claim          — Claim profile submission (v1: just stores the request)
```

All endpoints: validate input with Zod, store in database via Drizzle, send notification email via Resend, return success/error JSON. Include honeypot field for spam prevention.

---

## 8. Internationalization

- Astro i18n routing: /en/... and /es/...
- All UI copy (nav, buttons, labels, form placeholders, section headings, CTAs) must have EN and ES translations.
- Store translations in a structured file (e.g., src/i18n/en.json, src/i18n/es.json).
- Startup data: use one_liner/one_liner_es, tech_description/tech_description_es, etc. Fallback to EN if ES is null.
- Language toggle in nav switches between /en/current-path and /es/current-path.
- SEO: separate meta titles/descriptions per language, hreflang tags, bilingual sitemap.
- URL slugs for pages are translated (directory/directorio, insights/perspectivas, about/nosotros). Startup slugs stay the same in both languages. For Startups uses /startups in both languages.

### Route map

| Page | EN | ES |
|------|----|----|
| Home | /en | /es |
| Directory | /en/directory | /es/directorio |
| Startup Profile | /en/startup/[slug] | /es/startup/[slug] |
| Insights | /en/insights | /es/perspectivas |
| For Startups | /en/startups | /es/startups |
| Contact | /en/contact | /es/contacto |
| About | /en/about | /es/nosotros |

---

## 9. Analytics (PostHog)

### Events to track:

- **Page views** — automatic via PostHog snippet
- **CTA clicks** — which CTA, which page, which language
- **Corporate modal** — opened, step completed (1/2/3), submitted, abandoned (which step)
- **Startup application form** — opened, step completed (1/2), submitted, abandoned
- **Program inquiry form** — submitted
- **PDF download gate** — form viewed, submitted, download initiated
- **Directory interactions** — search used, filter applied (which filter), card clicked, map dot clicked
- **Startup profile** — claim CTA clicked, sidebar CTA clicked, related startup clicked
- **Language toggle** — switched from/to

### Funnels to define:

- Corporate conversion: page view -> CTA click -> modal open -> step 1 -> step 2 -> step 3 -> submit
- Startup application: /startups view -> form start -> step 1 -> step 2 -> submit
- PDF download: /insights view -> scroll to gate -> form start -> submit -> download
- Directory exploration: landing -> directory -> filter/search -> profile view -> corporate CTA

---

## 10. SEO

- Each startup profile: unique meta title ("[Name] — 404 Mapped"), description (one-liner), OG image (auto-generated or vertical-colored card).
- JSON-LD structured data (Organization schema) on each startup page.
- Bilingual sitemap.
- Canonical URLs with hreflang for both language versions.
- Target keywords: "deeptech startups LATAM", "deeptech Latin America", "open innovation deeptech", "innovacion abierta deeptech", "startups deeptech latinoamerica".
- Page load under 3 seconds on 4G.

---

## 11. Build Order

Build in this exact order. Each step builds on the previous. Do not skip ahead.

### Phase A: Build the Platform

#### Step 1: Project scaffolding
- Create/configure the Astro app in the monorepo
- Configure Tailwind with CSS variables from the design spec
- Set up i18n routing structure (/en, /es) with route map
- Import fonts per design spec
- Create global layout with nav + footer (both languages)
- Verify the Drizzle + Neon Postgres connection works
- Set up PostHog snippet

#### Step 2: Data preparation
- Clean & validate the 60-startup CSV (`data.csv`)
- Map CSV columns to schema fields (see Data Model, §5)
- Map verticals: free-text → enum values (ai_ml, biotech, etc.)
- Map maturity levels: "Scale-up" → revenue, "Pre-Seed" → prototype, etc.
- AI-translate all Spanish text fields to English (one_liner, tech_description, problem_statement, business_model, key_results)
- Geocode cities → lat/lng (country centroids for MVP, city-level later)
- Strip PII into separate hidden fields (contact_name, contact_email, contact_phone)
- Output: clean JSON seed file ready for DB import

#### Step 3: Database schema
- Create all tables in Drizzle (startups, corporate_leads, startup_applications, startup_program_inquiries, report_downloads)
- Create maturity_level and vertical enums
- Run db:push to create tables in Neon
- Import seed JSON (all 60 startups)
- Verify data in DB

#### Step 4: Shared components
- Build the component library matching the design spec:
  - Button (primary, secondary, ghost)
  - Input (text, email, textarea, select, multi-select chips)
  - Card (startup card for directory/related sections)
  - Badge (maturity level, vertical tags)
  - StatBlock (big number + label)
  - SectionLabel (small uppercase heading)
  - InsightCallout (accent-bordered text block)
  - Modal (generic animated modal container)
- These are reused across every page. Get them right.

#### Step 5: Corporate Modal
- Build as standalone React component (2-step form, not 3)
- Wire to /api/leads/corporate (Zod validation + Drizzle insert + Resend notification)
- Test both form steps + success state + contextual variant
- This unblocks every page since they all reference it

#### Step 6: Landing Page
- Build section by section per spec in 6.1
- The dot-grid map is the hardest part. Build it as its own React island.
- For the map: use a precalculated array of lat/lng points forming the Americas landmass outline. Render as SVG circles. Layer startup dots on top.
- Wire CTAs to corporate modal and /startups route

#### Step 7: Directory Page
- Build the interactive map (reuse/extend the landing map component, add interactivity)
- Build filter bar + card grid as a React island
- Load all startup data as JSON at build time, embed in page
- All filtering is client-side
- Wire card clicks to /startup/[slug]
- Wire floating CTA to corporate modal

#### Step 8: Startup Profile Page
- Build [slug] dynamic route
- Query startup data at build time, prerender all profiles
- Handle empty fields gracefully (collapse sections, show claim prompt if sparse)
- Wire sidebar CTA to corporate modal with contextual startup info
- Build related startups query (same vertical, exclude current)

#### Step 9: Insights Page
- Build each chart section as a React island
- Use Recharts for all visualizations
- Make every data point clickable (link to directory with filter)
- Build the PDF download gate form, wire to /api/leads/report-download (Zod + Drizzle + Resend)
- Chart data will be placeholder during development, replaced with real analysis data in Phase C

#### Step 10: For Startups Page
- Build both form sections
- Wire to respective API endpoints (Zod + Drizzle + Resend)
- Both forms need validation + success states

#### Step 11: About / Methodology
- Mostly static content, simplest page
- Team cards, methodology timeline, logo grid

#### Step 12: Claim Flow
- "Claim this profile" on startup pages links to a simple form
- Form: name, role, email, proof of association (textarea)
- Stores in database via API endpoint + Resend notification
- 404tf reviews manually (no admin UI in v1, just check DB)

#### Step 13: Polish
- Animation pass: ensure all scroll-triggered animations work
- Responsive pass: test all pages at 480px, 768px, 1024px, 1440px
- i18n pass: verify all ES translations
- SEO pass: meta tags, JSON-LD, sitemap, OG images
- Performance pass: Lighthouse audit, optimize images, lazy load below-fold content
- Accessibility: WCAG 2.1 AA, keyboard navigation, screen reader testing
- PostHog pass: verify all events fire correctly

### Phase B: Data Expansion (parallel to Steps 6-9)
- Source 40+ additional startups to reach 100+ total
- Use same CSV format, run through Step 2 pipeline (clean → translate → geocode → seed)
- Re-seed database with expanded dataset
- Rebuild static pages with new data

> **Decision (2026-03-25):** "100+" is the launch target. Initial 60 startups from data.csv are seeded in Step 2. Additional startups are sourced in parallel and added incrementally. EN translations are AI-generated via Claude, manually reviewed.

### Phase C: Analysis & Statistics (after Phase B, before Step 13)
- Analyze the full 100+ dataset to find insights
- Compute all statistics for the Insights page charts (geographic distribution, vertical breakdown, funding landscape, maturity distribution, founding timeline)
- Generate findings and key takeaways
- Update Insights page with real computed data (replace development placeholders)
- Create the PDF report from the analysis
- Place PDF in public/ directory

### Phase D: Images & Final Polish (parallel to Phase C)
- Collect/create startup logos (use colored-initial placeholders where missing)
- Collect founder photos where available
- Populate image fields in the database
- Generate OG images for social sharing (one per startup profile)
- Final visual QA pass

---

## 12. UX Decisions Log

These decisions were made during planning. Do not revisit them during implementation.

1. **Corporate form is a modal, not a page.** Users never leave context. The modal triggers from every corporate CTA sitewide.

2. **Two startup sections on one page.** "Get on the Map" and "Sell to Corporates" live on the same /startups page, not separate pages.

3. **Directory and map are one synchronized system.** Filtering the grid filters the map. Clicking the map filters the grid. They are not separate sections.

4. **Landing page hero map is decorative only.** No filters, no tooltips, no click handlers. The interactive map lives on the Directory page.

5. **Insights data points link to the directory.** Every bar, segment, and stat in the Insights page is a clickable link to the directory with the relevant filter applied.

6. **Corporate CTA is primary everywhere.** It's the revenue driver. Startup CTAs are secondary in visual weight on every page except /startups.

7. **About/Methodology is footer nav only.** Not in the main nav. It's for validation seekers, not first-time browsers.

8. **Empty profile handling:** Collapse empty sections. If most fields are null, show minimal profile + prominent "This profile is being completed by the startup team" message. Never show empty labels or placeholder text.

9. **Image strategy for profiles:** 3 strictly typed visual slots (hero image, founder headshots max 3, partner logos max 6) + optional video URL. No generic gallery. No carousel. Images stored in repo for v1.

10. **Seeding:** Launch with enriched data from recopilation phase. Design handles sparse profiles gracefully but the goal is 100+ reasonably complete profiles at launch.

11. **Corporate modal is 2 steps, not 3.** Budget range and vertical chips were removed — they're conversion friction. Verticals of interest are inferred from context (which startup/page triggered the modal). (Decision 2026-03-25)

12. **Dot-grid map: full custom SVG, both hero and directory.** The continent made of dots IS the product story. Directory keeps hover/click/filter interactions. Cut: dot clustering, drag-to-resize. Mobile: map collapses behind toggle. (Decision 2026-03-25)

13. **PDF download gate: 2 fields only.** Name + email. Organization and role removed — each extra field drops conversion ~10%. (Decision 2026-03-25)

14. **AI translations for launch.** All 60 Spanish startup profiles translated to English via Claude. Manually reviewed before launch. (Decision 2026-03-25)

15. **Data pipeline: CSV → clean JSON → DB seed.** Step 2 handles enum mapping, geocoding, PII separation, and translation. Outputs a seed file that can be re-run when new startups are added. (Decision 2026-03-25)

16. **Contact page as modal fallback.** `/en/contact` and `/es/contacto` render the same corporate form as a standalone page. Allows bookmarking, sharing, deep-linking from campaigns, and search indexing. Modal remains primary in-context UX. (Decision 2026-03-25)

17. **No fabricated trust signals.** "Joined by 200+ innovation leaders" removed at launch. Use "First edition, 2026" to position as fresh, not popular. Add real numbers when they exist. (Decision 2026-03-25)

18. **9 verticals, not 11.** Blockchain/Web3 and Fintech removed from taxonomy. Neither is deeptech. Startups combining blockchain with deeptech classify under their primary vertical. (Decision 2026-03-25)

19. **3 audiences, 1 UX priority.** Corporates are primary (revenue driver). Startups are secondary (product growth via applications). VCs are tertiary (no custom UX, they use directory as-is). All CTAs and visual weight favor the corporate path. (Decision 2026-03-25)

20. **Map time-box: 16 hours.** If the custom dot-grid isn't working at 16 hours, ship a static pre-rendered SVG and iterate post-launch. A broken map is worse than a simple one. (Decision 2026-03-25)

21. **City-level geocoding for Peru from day one.** 33/60 startups are Peru — country centroids make the map useless. Use location field to differentiate at least Lima vs Arequipa vs other cities. Other countries can use centroids. (Decision 2026-03-25)

22. **Separate DB schema prefix.** Map tables use `map_` prefix (map_startups, map_corporate_leads, etc.) to avoid interleaving with landing's `landing_` prefix. Same Neon database, separate namespaces. (Decision 2026-03-25)

---

## 13. UX Principles for Trust & Conversion

These apply globally across every page and component. They are not suggestions. Implement all of them.

### Forms (revenue-critical)

**Progressive disclosure.** Never show all fields at once. Multi-step forms start with low-commitment fields (name, email) and escalate to detail (challenge description, budget). Each step should feel like a small, easy commitment, not a wall of inputs.

**Progress indicators on every multi-step form.** "Step 2 of 3" with a visual bar. Users who can see the end are 2-3x more likely to finish.

**Inline validation only.** Validate on blur, show errors next to the field, green checkmarks on valid fields. Never use full-page error states or alerts. Never clear the form on error.

**Restate value at every step.** Above each form step, a one-line reminder of what they get. Step 1: "Tell us about you." Step 2: "Help us find the right solution." Step 3: "Almost done — we'll respond within 2 days." The user should never wonder why they're filling this out.

**Confirmation with next steps.** After submission, always show: what happens next, when they'll hear back, and from whom. "Our team will review your request and respond within 2 business days with relevant deeptech matches." Vague confirmations ("Thanks! We'll be in touch.") kill trust.

**Mobile-first form design.** Single column always. Large tap targets (min 44px). No dropdowns that require precision tapping. Input types set correctly (type="email" for email, inputmode="numeric" where needed) so mobile keyboards match the field.

### Trust signals

**Specificity over superlatives.** "100+ startups across 12 countries" beats "the leading deeptech platform." Numbers are trust. Adjectives are marketing. Use numbers everywhere: profile counts, countries covered, funding totals, response time commitments.

**Social proof near every conversion point.** Place trust signals (partner logos, stat callouts, download counts) within visual proximity of CTAs and forms. Not at the top of the page where they're forgotten by the time the user scrolls to the form. The PDF download gate should show "Joined by 200+ innovation leaders" directly above the submit button, not in a separate section.

**Show the humans.** 404tf is a small team facilitating real connections, not an anonymous platform. Team photos on About page. "Our team will review" in confirmation messages, not "your submission has been received." The claim review process being manual is a feature, not a limitation — frame it as personal curation.

**Reduce perceived risk at every CTA.** Every button that asks for information should have a micro-copy safety net nearby:
- Forms: "We respond within 2 business days" or "No commitment required"
- PDF gate: "We respect your privacy. No spam."
- Corporate modal: "Free initial consultation" if applicable
- Startup program: "First pilot is free" where relevant

**Corporate logos and partner names are your highest-value trust asset.** On startup profiles, pilot partner names do more conversion work than anything else on the page. Make them visually prominent. On the landing page, any real corporate or institutional logos go near the conversion CTAs.

### Navigation & flow

**Never dead-end the user.** Every page must have a clear next action. After reading a startup profile: "Need a solution like this?" + related startups. After downloading the PDF: "Looking for a specific solution?" After browsing insights: every data point links to the directory. No page should end with just a footer.

**The corporate conversion modal must be reachable within one click from any point on the site.** This is the revenue action. It should feel omnipresent without being annoying. Floating CTA on directory, sidebar CTA on profiles, contextual CTAs on insights. One click to the form from anywhere.

**Reduce navigation options to reduce decision fatigue.** Main nav has 3 items, not 6. The landing page forks users into two paths (corporate vs startup), not four. The fewer choices a user faces, the more likely they act.

### Visual trust

**Consistency is trust.** If the card style, button style, color palette, or typography changes between pages, the user subconsciously registers it as unprofessional. The design spec exists for this reason. Never improvise a one-off component style.

**Data visualization quality signals expertise.** Poorly designed charts (rainbow colors, pie charts, cluttered axes, default Recharts styling) immediately undermine the "authoritative research" positioning. Every chart must look deliberately composed: minimal axes, clean labels, editorial spacing, curated color use. If a chart doesn't look like it belongs in a McKinsey report, redesign it.

**Loading states and transitions signal polish.** Skeleton screens while data loads (not spinners). Smooth modal transitions (not instant pop). Staggered card animations (not everything appearing at once). These micro-details are what separate "credible platform" from "someone's side project."

**Empty states are trust-critical.** Many startup profiles may launch with incomplete data. An empty profile with broken layout and missing sections screams "this isn't real." A sparse profile with a clean minimal layout and a confident "This profile is being completed by the startup team" message says "this is curated and growing." Design the empty state as carefully as the full state.

---

## 14. Files to Reference

- `design-spec.jsonc` — All visual tokens. Single source of truth for how things look.
- This file (`implementation.md`) — Architecture, behavior, and specs. Single source of truth for what to build.

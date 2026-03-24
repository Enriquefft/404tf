# 404 Tech Found · Brand Book v1.0

---

## 1 · Brand Essence

| Element              | Definition                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10 yr)**  | *Catalyse a LATAM deep-tech renaissance by turning breakthrough science into venture-grade companies, right where the talent is.*            |
| **Mission (1--3 yr)** | *Become Peru's #1 deep-tech pre-incubator -- graduating multiple "404 Founders" and launching our venture-builder/accelerator arm.*          |
| **Primary tagline**  | **"Building the 404 deep-tech startups of LATAM."**                                                                                          |
| **Positioning**      | *Built by deep-tech founders, for deep-tech founders.*                                                                                       |
| **Archetype**        | **Maverick x Explorer** -- rebellious, pioneering, boundary-pushing.                                                                         |
| **Core values**      | 1. **Science-first rigor**  2. **Radical openness**  3. **Purposeful failure**  4. **Community before ego**  5. **Momentum over perfection** |

### 1.1 Narrative timeline

| Year/Q      | Milestone                                            |
| ----------- | ---------------------------------------------------- |
| **2025 Q2** | Deeptech Meetup #01 -- proof of community demand     |
| **2025 Q3** | Pre-incubator Cohort alpha (18 teams)                |
| **2025 Q4** | Start our consultory, we know how to create deeptech |
| **2026 Q2** | Launch full **Incubator** track + micro-fund         |
| **2027 Q1** | **Venture-Builder** studio -- 3 in-house spin-outs   |
| **2030 Q4** | 100 LATAM deep-tech companies backed, 5 global exits |

---

## 2 · Audience Matrix & Personas

| Segment                    | Proto-persona                               | Need / Pain                          | Perception Goal          | Key Touch-points                  |
| -------------------------- | ------------------------------------------- | ------------------------------------ | ------------------------ | --------------------------------- |
| **Investors** (VC/CVC)     | *Maria V.* -- Deep-tech partner, US fund    | Credible pipeline, de-risked science | Trust · Tech-edge        | Deal rooms, demo days, data rooms |
| **Corporate partners**     | *Carlos R.* -- Chief Innovation, mining corp | POCs, cutting-edge IP                | Reliability · Win-win    | Partner deck, PoC roadmap         |
| **Government & agencies**  | *Ana S.* -- Innovation director, Produce    | Talent retention, GDP impact         | National pride · Clarity | Policy briefs, public reports     |
| **Founders / Researchers** | *Lucia P.* -- PhD biotech student           | Funding, biz know-how, community     | Belonging · Empowerment  | Programme site, Discord           |
| **Media / Public**         | *Diego M.* -- Tech journalist               | Breakthrough stories                 | Excitement · Credibility | Press kit, social, AMAs           |

---

## 3 · Personality & Voice

### 3.1 Voice sliders

| Axis                  | Position        |
| --------------------- | --------------- |
| Formal -- Casual      | Leans casual    |
| Playful -- Serious    | Center-playful  |
| Academic -- Accessible | Leans accessible |

### 3.2 Tone-of-voice Do/Don't

| Do                                              | Don't                                  |
| ----------------------------------------------- | -------------------------------------- |
| "Let's rewrite the laws of what's possible."    | "Disruptive paradigm shift synergies!" |
| Spanish: use **tu** / informal *vosotros* tone. | Overly corporate "Estimado senor".     |
| Use emoji sparingly (max 1 per post).           | Emoji chains                           |
| Cite sources for scientific claims.             | Hand-wave tech details.                |
| Plain-English explainers ("in 2 lines").        | Dense academic abstracts.              |

### 3.3 Boiler-plates

```text
EN (50 w): 404 Tech Found is LATAM's maverick deep-tech pre-incubator,
built by founders for founders. We turn breakthrough science into
venture-grade companies.

ES (50 w): 404 Tech Found es la pre-incubadora deep-tech de LATAM,
creada por fundadores para fundadores. Convertimos ciencia de frontera
en empresas escalables.
```

---

## 4 · Visual Identity System

### 4.1 Logo

| Variant                  | Use case                  |
| ------------------------ | ------------------------- |
| **Horizontal lock-up**   | Website nav, deck footers |
| **Inverse (near-white)** | Dark bgs / gradients      |
| **Isotype-only**         | Favicon, social avatar    |

> TODO: Logo assets need to be finalized (logomark, wordmark, lockup).
> Current state: text-based wordmark only ("404 / TECH FOUND" in Big Shoulders Display).

#### Mis-use examples

| Rule                      | Why                  |
| ------------------------- | -------------------- |
| No stretch / squash       | Distorts proportions |
| No drop shadows           | Reduces contrast     |
| No colours outside palette | Breaks consistency   |
| No low-contrast on gradients | Fails WCAG        |

### 4.2 Colour palette

> Purple hue shifted from 285 (generic blue-violet) to 305 (warm red-violet) to avoid the "generic startup purple" pattern. Amber secondary provides differentiation. All neutrals are tinted with purple chroma (hue 315), NOT pure gray.

```
# CORE
primary:     #9B35A8  oklch(0.53 0.24 305)   warm red-violet purple
secondary:   #D49420  oklch(0.72 0.18 55)    forge amber

# HOUSES
ai:          #E84070
biotech:     #18C060
hardware:    #D85030
space:       #3080E0

# SURFACES (dark mode)
surface-bg:     #0F080F  oklch(0.07 0.020 315)  purple-tinted near-black
surface-fg:     #EDE8E0                          warm off-white
surface-card:   #1A0E1C                          elevated, more purple chroma
surface-muted:  #766878                          purple-tinted gray

# UTILITY
destructive: #f24545
```

*All fg/bg combos must >= 7:1 contrast.*

### 4.3 Typography

| Level   | Typeface                          | Weight / Size / Tracking                                 |
| ------- | --------------------------------- | -------------------------------------------------------- |
| Hero    | **Big Shoulders Display**         | 900 · clamp(8rem, 25vw, 20rem) · -0.03em                |
| Display | **Big Shoulders Display**         | 900 · clamp(3rem, 9vw, 8rem)                            |
| Logo    | **Big Shoulders Display**         | custom glyphs                                            |
| H1      | **Big Shoulders Display Variable**| 700 · clamp(1.5rem, 3vw, 2.5rem)                        |
| Body    | **Barlow Semi Condensed**         | 400 · 1.0625rem · line-height 1.75                      |
| Caption | **Barlow Semi Condensed**         | 500 · 0.8125rem                                          |
| Label   | **Barlow Semi Condensed**         | 500 · 0.6875rem · 0.16em tracking · uppercase            |
| Code    | **JetBrains Mono**                | 400 · 0.875rem                                           |

*Fallback stack*: `"Barlow Semi Condensed", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif`.
*Heading fallback*: `"Big Shoulders Display", Impact, "Arial Black", sans-serif`.

### 4.4 Supporting imagery

Guidelines for visual content across formats:

**Informational posts:**
- Minimal backgrounds with flat color or gradients in primary/secondary tones.
- Digital interface elements like data charts or futuristic HUDs.
- Visual representations of deeptech concepts (DNA, cells, circuits, neural networks).

**Promotional videos:**
- Fluid transitions and glitch effects.
- People working in labs or tech startups.
- Futuristic cityscapes with integrated technology.

**Announcements & news:**
- Classified-document mockups with tech styling.
- "Hacker" aesthetic with monospace typography and digital overlays.
- Futuristic terminal captures with running code.

**Disruptive / shitpost content:**
- Glitch and visual distortion effects.
- Stylized 404 error captures with neon effects.
- Memes based on science, startup, and deeptech references.

### 4.5 Mascot -- "Tardi"

| Item          | Detail                                                                              |
| ------------- | ----------------------------------------------------------------------------------- |
| Species       | Tardigrade                                                                          |
| Master file   | `tardi_master.png`                                                                  |
| Allowed edits | Minor expression, accessories; **no** hue-shift or horizontal flip (cyber-eye left) |
| Usage         | Community & swag. Formal docs: only in team slide footer @ 16% opacity.             |

> TODO: Tardi master asset needs to be added to `assets/mascot/`.

### 4.6 Programme Houses

| House    | Colour    | Tagline                               |
| -------- | --------- | ------------------------------------- |
| AI       | `#E84070` | "Code that thinks."                   |
| Biotech  | `#18C060` | "Evolving life, engineering futures." |
| Hardware | `#D85030` | "Atoms to products."                  |
| Space    | `#3080E0` | *(tagline TBD)*                       |

House banners: core logo top-left + 4 px colour bar full-width.

### 4.7 Corners & Borders

Border radius: **0rem** (brutalist). Borders: **2px**, never 1px.

### 4.8 Accessibility -- WCAG AAA

| Element       | Rule                                             |
| ------------- | ------------------------------------------------ |
| Contrast      | >= 7:1 for text, >= 4.5:1 for non-text UI       |
| Min font size | Web 16 px, Print 12 pt                           |
| Focus style   | 3 px primary `#9B35A8` outline, offset 2 px      |
| Motion        | Provide `prefers-reduced-motion` alt: static SVG |
| Alt-text      | Mandatory (EN & ES) for every published asset    |

---

> **404 Tech Found** -- *Where anomalies thrive and tomorrow is engineered today.*

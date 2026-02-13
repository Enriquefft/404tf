# Feature Landscape

**Domain:** Hackathon landing page with registration and trading card identity system
**Researched:** 2026-02-13

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Registration form** | Core hackathon requirement — participants must be able to sign up | Low | Name, email, basic fields. Expected on landing page itself, not buried |
| **Event details** | Users need to know when, where, and what before registering | Low | Dates, location (if physical), format (virtual/hybrid/in-person) |
| **FAQ section** | Addresses common questions about cost, eligibility, rules | Low | Accordion pattern standard. Topics: cost, team size, eligibility age, what to bring |
| **About/Vision** | Explains event purpose, goals, organizing team | Low | Builds trust and context for "why participate" |
| **Code of Conduct** | Community safety and inclusivity expectations | Low | Often footer link or dedicated section. Required by platforms like MLH |
| **Contact info** | Support channel for questions/issues | Low | Email, social media, or community Discord/Slack |
| **Mobile responsive** | 40%+ traffic on mobile, critical for registration | Medium | Esp. important for form fields and CTA buttons |
| **Clear CTA** | "Register Now" must be visible and unambiguous | Low | Single primary CTA. Multiple competing CTAs confuse users |
| **Sponsors section** | Builds credibility and professional legitimacy | Low | Logos with links to sponsor sites. Shows event is backed/funded |
| **Schedule/Timeline** | What happens when during the event | Low | Often added 1+ month before event, not required at launch |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Trading card identity system** | Gamified registration — participants receive shareable identity cards | High | Core differentiator. Makes registration fun, creates viral incentive |
| **Dynamic OG images** | Social sharing shows personalized card preview, not generic hackathon logo | Medium | Drives viral growth via visual uniqueness when sharing /c/[name] links |
| **Sequential agent numbers** | Scarcity + FOMO ("I'm #42!") + collectibility | Low | DB-backed, deterministic. Creates urgency to register early |
| **Deterministic card generation** | Same name always generates same card (6 builder classes, consistent visuals) | Medium | Enables shareable permalinks /c/[name] without account creation |
| **Canvas PNG export** | Participants download high-res cards for social media | Medium | Browser-side Canvas API. Enables sharing beyond platform |
| **Challenge page permalinks** | /c/[name] creates public profile without login | Low | Lowers friction for viral recruitment ("check out my card!") |
| **Bilingual ES/EN** | Accessible to Spanish-speaking LATAM participants | Medium | Table stakes for LATAM events, differentiator for US-centric events |
| **Track/House selection** | Participants choose builder class (AI/Biotech/Hardware) at registration | Low | Gamification layer. Adds identity beyond just "participant" |
| **Scroll-aware navbar** | UX polish — navbar hides on scroll down, shows on scroll up | Medium | Not essential but improves mobile UX on long landing pages |
| **Real-time availability** | "X spots left" or "Join 142 builders" social proof | Medium | Requires DB query. Creates urgency and FOMO |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Multi-step registration wizard** | Increases abandonment. Hackathon registration should be fast | Single-page form with 4-6 fields max. Trading card is the reward, not a burden |
| **Account creation requirement** | Friction barrier. Trading cards are for viral sharing, not gated content | Deterministic generation from name only. No login needed to view /c/[name] |
| **Random card generation** | Breaks shareability. If card changes on refresh, permalinks are useless | Deterministic hash-based generation. Same input = same card always |
| **Generic OG images** | Missed viral opportunity. Social shares should show the person's card | Dynamic OG images using Next.js ImageResponse at /c/[name]/opengraph-image |
| **Heavy animations on load** | Hurts Core Web Vitals and mobile performance. Slow = abandoned registrations | Subtle scroll-triggered reveals only. Hero/CTA must load instantly |
| **Feature overload on CTA** | "Register + Join Discord + Follow Twitter" dilutes action | Single primary CTA: "Register Now". Secondary CTAs in footer/body |
| **Keyword stuffing SEO** | Hurts readability and modern ranking algorithms | Focus on clear value prop and benefits-focused copy |
| **Complex prize tiers** | Confuses participants. "Which track am I eligible for?" | Simple, clear categories. 1-3 prize tiers max. Judging criteria visible |
| **Edit/delete card after creation** | Adds complexity (auth, DB updates) for minimal value | Cards are deterministic and shareable. No editing needed — re-register with new name if needed |
| **Leaderboard/competitive rankings** | Creates negative dynamics ("I'm ranked #500"). Hackathons are collaborative | Social proof via participant count only. "Join 142 builders" not "You're ranked #143" |

## Feature Dependencies

```
Registration Form
  ├─> Sequential Agent Number (requires DB)
  └─> Trading Card Generation
        ├─> Deterministic Card (hash from name + track)
        ├─> Canvas PNG Export (client-side)
        └─> Challenge Page Permalink /c/[name]
              └─> Dynamic OG Image (ImageResponse)

Bilingual ES/EN
  ├─> Registration Form (translated fields)
  ├─> FAQ (translated questions)
  ├─> About/Manifesto (translated copy)
  └─> Trading Cards (translated class names)

Social Sharing
  ├─> Challenge Page Permalink (must exist to share)
  └─> Dynamic OG Image (visual hook for shares)
```

**Critical path for viral growth:**
1. Registration → Agent number + Trading card
2. Challenge page /c/[name] → Shareable permalink
3. Dynamic OG image → Visual preview on social platforms
4. Canvas export → Download and share on Instagram/Twitter

## Backend Feature Requirements

### 1. DB-Backed Registrations

**Purpose:** Persistent sequential agent numbers, stored participant data

**Technical requirements:**
- Database table: `participants` with fields `id`, `agent_number`, `name`, `email`, `city`, `track`, `locale`, `created_at`
- Sequential agent number generation strategy (see complexity note)
- Duplicate detection (same email = existing agent number, not new registration)
- Query endpoint for /c/[name] to fetch participant data

**Complexity: MEDIUM**

**Sequential ID strategy:**
- Simple approach: Postgres `SERIAL` or `BIGSERIAL` auto-increment (single DB instance)
- Exposed to public: Not directly. Agent numbers are public, but don't leak business intelligence (hackathon registrations are meant to be visible)
- Tradeoff: Sequential IDs are human-readable (#42), create scarcity/FOMO, and enable easy ordering
- Security: No concern for hackathons (participant count is public metric)
- Reference: [7 Strategies for Assigning Ids](https://simpleorientedarchitecture.com/7-strategies-for-assigning-ids/), [Random IDs burned me once, Now I stick to sequential IDs](https://medium.com/@himanshusingour7/random-ids-burned-me-once-now-i-stick-to-sequential-ids-0947d141363b)

**Database operations:**
- INSERT on registration (with duplicate check on email)
- SELECT by name for /c/[name] pages
- COUNT(*) for social proof ("Join X builders")

**Migration from Vite SPA:**
- Vite version: No persistence, client-only card generation
- Next.js version: Server actions for registration, DB storage, persistent agent numbers

### 2. Dynamic OG Images

**Purpose:** Social sharing shows participant's trading card as preview image

**Technical requirements:**
- Next.js ImageResponse constructor (`next/og`)
- Route: `/app/[locale]/c/[name]/opengraph-image.tsx`
- Fetch participant data from DB by name
- Render trading card using JSX + CSS (same visual as client card)
- Export metadata: `size: { width: 1200, height: 630 }`, `contentType: 'image/png'`

**Complexity: MEDIUM**

**Technical constraints (Next.js 16.1):**
- Only flexbox supported (no CSS Grid)
- Subset of CSS properties work (see [ImageResponse docs](https://nextjs.org/docs/app/api-reference/functions/image-response))
- 500KB bundle size limit (includes JSX, CSS, fonts, images)
- Optimal size: 1200x630px (Twitter also accepts 1200x600)
- Reference: [Next.js Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [Generate Dynamic OG Images with Next.js 16](https://makerkit.dev/blog/tutorials/dynamic-og-image)

**Caching strategy:**
- OG images rarely change (deterministic cards from name + track)
- Cache for long duration (1 week to 1 month)
- Revalidate on-demand if participant updates track (unlikely if no edit feature)

**Migration from Vite SPA:**
- Vite version: Not possible (static hosting, no server-side rendering)
- Next.js version: Server-side ImageResponse at /c/[name]/opengraph-image

**Testing:**
- Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) or [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Test meta tags: `<meta property="og:image" content="https://domain.com/c/[name]/opengraph-image" />`

## MVP Recommendation

For MVP (hackathon launch-ready), prioritize:

### Must-Have (Week 1)
1. **Registration form** (table stakes) — name, email, city, track selection
2. **DB-backed registrations** (differentiator) — persistent agent numbers, stored data
3. **Trading card generation** (differentiator) — deterministic cards with 6 builder classes
4. **Challenge page /c/[name]** (differentiator) — shareable permalinks
5. **Event details** (table stakes) — dates, location, vision
6. **FAQ** (table stakes) — cost, eligibility, team size
7. **Mobile responsive** (table stakes) — registration form must work on mobile

### Should-Have (Week 2)
8. **Dynamic OG images** (differentiator) — social sharing visual hook
9. **Canvas PNG export** (differentiator) — download cards for Instagram/Twitter
10. **Bilingual ES/EN** (differentiator) — if LATAM audience
11. **Sponsors section** (table stakes) — credibility and funding proof
12. **Code of Conduct** (table stakes) — community safety

### Nice-to-Have (Post-MVP)
13. **Real-time social proof** ("Join 142 builders")
14. **Schedule/Timeline** (added 1 month before event)
15. **Scroll-aware navbar** (UX polish)
16. **Prizes/Judging criteria** (can be added closer to event)

## Defer to Post-MVP

- **Team formation tools**: Not core to registration. Can use external Discord/Slack
- **Project submission portal**: Separate phase after hackathon starts
- **Live schedule updates during event**: Can use static schedule + announcements
- **Mentor/Judge registration**: Separate forms if needed, not participant-facing
- **Email notifications**: Nice-to-have for confirmation, not critical for launch
- **Admin dashboard**: Can manage via Drizzle Studio for MVP

## Existing vs New Features

### Already Built (Migrating from Vite)
- Navbar (responsive, scroll-aware, bilingual toggle) ✓
- Hero with registration form ✓
- Trading card system (6 builder classes, Canvas export) ✓
- Challenge page /c/[name] routing ✓
- Manifesto, Judging & Prizes, Hubs, Sponsors, FAQ, Footer ✓
- Bilingual ES/EN ✓

### New Features (Next.js Enables)
1. **DB-backed registrations** — Sequential agent numbers, persistent storage
2. **Dynamic OG images** — /c/[name]/opengraph-image for social sharing

### Migration Focus
- Port existing UI components (already built, just needs Next.js 16 App Router conversion)
- Add Server Actions for registration form (replaces client-only state)
- Implement Drizzle ORM schema and DB connection
- Add ImageResponse for dynamic OG images

## Sources

**Hackathon Landing Pages:**
- [Main Website - Hackathon Organizer Guide (MLH)](https://guide.mlh.io/general-information/hackathon-website/main-website)
- [Best Hackathon Websites - Webflow](https://webflow.com/made-in-webflow/hackathon)
- [5 Best Hackathon Software (2026 Review) - InnovationCast](https://innovationcast.com/blog/hackathon-software)

**Dynamic OG Images:**
- [Getting Started: Metadata and OG images - Next.js](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Generate Dynamic OG Images with Next.js 16 - MakerKit](https://makerkit.dev/blog/tutorials/dynamic-og-image)
- [Dynamic Open Graph Images in Next.js - Deuex Solutions](https://blogs.deuexsolutions.com/how-to-create-dynamic-open-graph-images-with-nextjs)

**Gamification & Identity:**
- [Hackathon Participant Badge Generator with QR Code - n8n](https://n8n.io/workflows/11016-hackathon-participant-badge-generator-with-qr-code-pdf-and-email-delivery/)
- [Gamification in 2026: Going Beyond Stars, Badges and Points - Tesseract Learning](https://tesseractlearning.com/blogs/view/gamification-in-2026-going-beyond-stars-badges-and-points/)

**Database ID Generation:**
- [7 Strategies for Assigning Ids - Simple Oriented Architecture](https://simpleorientedarchitecture.com/7-strategies-for-assigning-ids/)
- [Random IDs burned me once, Now I stick to sequential IDs - Medium](https://medium.com/@himanshusingour7/random-ids-burned-me-once-now-i-stick-to-sequential-ids-0947d141363b)
- [Identity Crisis: Sequence v. UUID as Primary Key - brandur.org](https://brandur.org/nanoglyphs/026-ids)

**Social Sharing & Viral Growth:**
- [How to Make a Mobile App Go Viral in 2026 - WEZOM](https://wezom.com/blog/how-to-make-a-mobile-app-go-viral-in-2025-proven-growth-strategies)
- [Top Growth Hacking Approaches for 2026 - AiLeads](https://www.aileads.now/blog/top-growth-hacking-approaches-for-2026)

**Landing Page Best Practices:**
- [10 Landing Page Mistakes You Should Avoid in 2026 - Moosend](https://moosend.com/blog/landing-page-mistakes/)
- [Top Landing Page Copywriting Mistakes to Avoid in 2026 - LandingPageFlow](https://www.landingpageflow.com/post/top-landing-page-copywriting-mistakes-to-avoid)

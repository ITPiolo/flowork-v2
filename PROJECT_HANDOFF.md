# flowork v2 — Project Handoff / Continuity Document

**Purpose of this file**: upload this into Claude Project Knowledge so any
new chat in this project has full context immediately, without needing
to re-explain the whole build history.

**Live (staging):** https://flowork-v2-gold.vercel.app
**Repo:** https://github.com/ITPiolo/flowork-v2
**Stack:** Next.js 16 (App Router, Turbopack) + Tailwind + Framer Motion + Supabase
**Local path:** C:\Users\user\Desktop\flowork-v2

---

## CRITICAL — read before doing anything

1. **NEVER run `npm audit fix --force`** — it silently downgrades Next.js
   to an incompatible ancient version and breaks the whole project. Plain
   `npm audit` (no `--force`) is safe to check anytime. This happened
   once already and took real effort to recover from.

2. **When giving code for files longer than ~50 lines, give the COMPLETE
   file, not a surgical edit.** This project hit repeated, painful bugs
   from partial/surgical edits landing in the wrong place, especially in
   `lib/puckConfig.tsx` and `app/page.tsx`. The user copy-pastes manually
   in VS Code and small "find this snippet, replace with this" instructions
   have failed multiple times, costing significant time and trust. Prefer
   full-file replacement, and for files over ~150 lines, package as a
   downloadable file via `present_files` rather than a giant chat block.

3. **After creating any new file, always tell the user to verify it isn't
   empty** — several times a file was "created" in VS Code but never
   actually had content pasted in, causing "is not a module" TypeScript
   errors. This is a very common failure mode with this user's workflow.

4. **The user is non-technical-ish** — comfortable running the given
   PowerShell commands (`npm run build`, `git add/commit/push`) but not
   comfortable debugging code themselves. Always give exact commands to
   run, in order, and ask for the literal output before proceeding.

5. **Do not reproduce content from real client documents.** This user's
   business handles real client proposals, contracts, and occupancy data
   with actual company names and financials. Never treat those as
   reusable template content — see "Proposal Library" section below for
   the resolution reached on this.

6. **Every deploy check follows this pattern:**
   ```
   npm run build
   git add .
   git commit -m "..."
   git push
   ```
   Vercel auto-deploys from GitHub on every push. Always ask for the
   `npm run build` output before assuming a push should happen.

---

## What's fully built and confirmed working

### Public site
- Home (`/`), Locations index + `/locations/[slug]`, `/services/[slug]`,
  `/ejari`, `/blog` + `/blog/[slug]`, `/about`, `/contact`, `/faqs`
  (real content), `/privacy-policy`, `/terms`
- Homepage is now **Puck-rendered** for its editable marketing sections
  (Hero, Trust Bar, Why Flowork, Testimonials) — see "Page Builder"
  section below. Services grid, Podcast feature, Enquiry form, and Blog
  preview stay hardcoded (live data, already editable via their own
  admin sections).
- Blog preview on homepage and `/blog` both use the plain static grid
  (`BlogPreview.tsx`) — a horizontal "scroll-jacking" gallery
  (`HorizontalBlogScroll.tsx`) was attempted multiple times and proved
  too fragile (`position: sticky` + width-measurement bugs that were
  hard to diagnose without live browser access). **Do not re-attempt
  this pattern unless the user explicitly asks and accepts the risk.**
- Custom pages built via drag-and-drop render at `/[slug]`
- Public per-unit pages at `/units/[unitId]` — deliberately shows ONLY
  non-sensitive info (category, size, workstations, availability) via a
  Postgres VIEW (`public_unit_info`), never the real `occupancy_units`
  table directly — this was a deliberate security decision since these
  pages are meant for QR codes scanned by the public.
- 360° virtual tour (Pannellum, CDN-loaded) for Boardroom + Podcast Room
  — real photography, not placeholder. Vision Tower and Dubai Hills use
  different image formats (SVG vs PNG) but same hotspot mechanism.
- Rate-limited enquiry form (`EnquiryForm.tsx`) — dark card design,
  single-column layout (a nested 2-column grid was tried and caused
  cramped/broken layouts — don't reintroduce that).
- Structured data (JSON-LD), Open Graph via static image reference (a
  dynamic `opengraph-image.tsx` using `ImageResponse` was attempted but
  hit a Turbopack-specific bug — reverted to a static image URL instead).

### Admin dashboard (`/admin`, Supabase Auth)
- **IMPORTANT STRUCTURE**: `app/admin/(dashboard)/` is a route group.
  This exists specifically so `/admin/login` sits OUTSIDE the auth-gated
  layout, avoiding an infinite redirect loop (a real bug hit and fixed
  early on). Never move admin pages out of this group without
  understanding why it's there.
- **`proxy.ts`** (project root) is `middleware.ts` renamed per Next.js
  16's convention — exported function is named `proxy`, not `middleware`.
- Sections: Overview (CRM pipeline dashboard), Pages (drag-and-drop
  builder), Enquiries (CRM with notes/email composer), Locations,
  Services, Blog, Ejari Pricing, Media Library, Newsletter, Proposal
  Library, Occupancy, Integrations.

### Page Builder (Puck)
- `lib/puckConfig.tsx` defines every block. Two categories: "Ready-made
  sections" (Hero, TextImage, Gallery, Testimonial, CTA, FAQAccordion,
  Stats, TrustBar, WhyFlowork, RotatingHero, TestimonialsCarousel) and
  "Individual elements" (Heading, Paragraph, Image, Button, Divider,
  Spacer, LogoStrip).
- **CRITICAL PATTERN**: Puck's `<Render>` component cannot be called
  directly from a Server Component with `config` passed as a prop — this
  throws "Functions cannot be passed to Client Components." The fix,
  already implemented: `components/PuckRenderer.tsx` is a small Client
  Component that imports `puckConfig` directly (not as a prop) and only
  receives the page `data` (plain JSON) as a prop. Both `app/page.tsx`
  and `app/[slug]/page.tsx` use this wrapper. **Any new place that
  renders Puck content must use this same `PuckRenderer` pattern.**
- Interactive blocks (RotatingHero, TestimonialsCarousel, TrustBar) live
  in `components/blocks/` as separate Client Components, referenced from
  `puckConfig.tsx`'s `render` functions — this is required because
  `puckConfig.tsx` itself gets imported by both server and client code,
  so it can't contain hooks directly.
- Homepage content is seeded in the `custom_pages` table under the
  reserved slug `__home__`. See `supabase/homepage_seed.sql`.
- Image fields use `PuckImageField` (drag-and-drop upload to Supabase
  Storage `media` bucket, with manual URL fallback) — wired into the
  page builder AND into Location/Service/Blog admin forms.

### CRM Pipeline
- Enquiries flow through stages: New → Contacted → Proposal Sent →
  Won/Lost. Per-lead notes/activity log. CSV export with date/stage
  filters. Email composer with HTML signature support (logo embed) and
  comma-separated multi-recipient To/CC/BCC.
- Lead intake: website form (`/api/enquire`) + a generic external
  webhook (`/api/leads/[source]`) for future Meta/Property Finder/Bayut
  integration, protected by `LEADS_WEBHOOK_SECRET`.

### Proposal Library — IMPORTANT CONTEXT
- Originally attempted an AI-assisted "redaction tool" to turn old
  proposals into reusable templates by stripping client-specific details.
  **This was removed** after the client clarified their proposals are
  Canva-designed, visually rich, and change too often for a rigid
  template system to make sense. The AI redaction tool also raised real
  confidentiality concerns (processing past clients' real names/pricing
  through an AI). **Do not rebuild this feature unless explicitly
  re-requested with a clear reason.**
- What remains: a simple upload/organize/tag library
  (`/admin/proposals`) for existing proposal files (PDF/Word), searchable
  by category. Client uploads finished proposals themselves; the system
  doesn't generate or edit their content.
- **Confidentiality rule established in this project**: Claude should
  never be shown or asked to process real client proposals, contracts,
  or personal data belonging to flowork's OWN clients — that data should
  stay entirely within the client's own systems, uploaded by them
  directly, never pasted into chat with Claude.

### Occupancy Management (floor plans)
- Rebuilt from an existing legacy system (`signin.flowork.ae`) — real
  hotspot coordinates (rectangle positions) were extracted directly from
  that system's source code and re-seeded here (see
  `supabase/occupancy_hotspots_seed.sql`), saving enormous manual
  re-drawing effort. Only geometry was reused — no client data.
- **Current status coloring system** (as of last session) — THREE
  categories, not the original four:
  - **Occupied** (blue `#3B82F6`) — fixed-term lease, not expiring soon
  - **Expiring** (green `#5ab88a`) — covers BOTH vacant units AND
    occupied units with renewal within 60 days (unified into one
    category since both read as "available now or soon" to sales staff)
  - **Month-to-Month** (orange `#e8943a`) — occupied on a rolling
    agreement, no fixed end date (new `lease_type` column, values
    `'fixed'` | `'month_to_month'`)
  - Logic lives in `lib/occupancyStatus.ts` — `computeStatus()`.
- QR codes per unit link to the public `/units/[unitId]` page (safe
  view, no pricing/tenant info shown — client specifically asked for NO
  pricing disclosure anywhere public, they prefer in-person/call
  discussions for pricing).
- CSV import (`components/admin/OccupancyImport.tsx`) was rebuilt to
  recognize the client's REAL spreadsheet headers directly (e.g. "Office
  No.", "Rental Company Name", "Renewal Date") via a `FIELD_ALIASES` map,
  rather than requiring them to reformat to our internal template — the
  first version silently failed to import almost anything because
  headers didn't match, which took real debugging effort to diagnose.
  If new spreadsheet formats appear, add more aliases to that map rather
  than asking the client to reformat their data.
- Automated renewal check: `/api/check-renewals`, meant to run daily via
  Vercel Cron (`vercel.json`), protected by `CRON_SECRET`. Sends a digest
  email of upcoming renewals — currently inactive pending SMTP setup.

---

## Environment variables — status as of last session

| Variable | Purpose | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Core | ✅ Set |
| `CRON_SECRET` | Renewal check auth | ✅ Set |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email composer, renewal alerts | ⏸️ NOT set — needs a Microsoft 365 app password. Client wants SMTP (not Graph API), simple approach. |
| `LEADS_WEBHOOK_SECRET` | External lead intake | ⏸️ NOT set — needs Meta/Property Finder access, which the client hasn't connected yet |
| `NEXT_PUBLIC_BROCHURE_URL` | Footer download button | ⏸️ In progress — client uploading brochure PDF to Proposal Library, needs to grab the URL |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta ad tracking | ⏸️ Deferred by client — "let's do later" |
| `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` | LinkedIn ad tracking | ⏸️ Deferred by client — "let's do later" |

---

## Known content gaps (not code — needs real human input)

- **About page**: still has generic AI-written placeholder copy. Client
  confirmed this is NOT real and needs a genuine rewrite with actual
  team/company specifics before launch.
- **Testimonials**: intentionally kept as generic placeholder quotes —
  client explicitly decided real client names shouldn't be displayed
  (privacy concern), so this is a deliberate final state, not a gap.
- **FAQ**: real content, client-provided. Already implemented correctly.

---

## Deliberately NOT built / explicitly deferred

- **Domain cutover**: site lives at `flowork-v2-gold.vercel.app`. The
  real `flowork.ae` domain still points at the old NameHero/WordPress
  site. Client wants to finish testing before cutover — no timeline set.
- **NameHero cPanel hosting migration**: explored as a cost-saving idea,
  concluded Vercel's free Hobby tier already covers this project at
  $0/month, so migrating would add real complexity/risk for zero
  savings. Client agreed to stay on Vercel. Revisit only if a
  non-cost reason comes up.
- **Stripe real payment integration**: Virtual Office pricing currently
  links to placeholder Stripe payment links from the original site, not
  a real integration. Deferred at client's request.
- **Meta/Property Finder/Bayut lead integrations**: intake endpoint and
  admin hub UI exist and are ready; the actual platform-side webhook
  setup requires the client's marketing team to connect their own
  accounts, hasn't happened yet.

---

## Design/UX decisions worth knowing

- Brand colors: charcoal `#1A1D18`, sage `#7C8A6D` (+ shades 50-700),
  cream `#F7F5EF`, sand `#C9A876` (gold accent, used sparingly e.g.
  italic text accents).
- Fonts: Fraunces (display/headings) + Inter (body).
- Hero section: responsive — mobile/tablet uses a full-bleed photo with
  centered overlay text (original design); desktop uses a split-screen
  layout (solid charcoal panel with text on the left, full vibrant photo
  on the right, no overlay needed since text never sits on the image).
  Both rotate through 3 photos with a Ken Burns zoom effect.
- Lenis smooth-scroll was added then REMOVED — caused motion
  sickness/dizziness for the user. Do not re-add without explicit
  request, and if requested, flag the accessibility concern.
- Trust bar / stat counters: count-up number animations are used
  sparingly and carefully — small numbers (like "2") don't animate well
  and looked "broken" when caught mid-frame in screenshots. The current
  implementation uses a single shared `useInView` trigger (not per-card)
  to keep all numbers synchronized, and `useMemo` to prevent an infinite
  animation-restart bug from an unstable object reference in a
  `useEffect` dependency array.

---

## Communication patterns that work well with this user

- Give exact PowerShell commands in the exact order to run, don't assume
  they'll figure out the sequence.
- After every code change: `npm run build` → paste output → THEN
  git add/commit/push (verify locally before pushing broken code live).
- When something visual is wrong, ask for a screenshot before guessing —
  but also don't over-ask; if the user has already described it clearly
  enough, proceed with a concrete fix rather than requesting more detail.
- The user gets frustrated (understandably) after 3+ failed attempts at
  the same bug — at that point, offer to revert to the last known-stable
  version rather than continuing to guess blindly.
- Real client data (names, prices, contracts) should never be pasted
  into chat by the user — redirect them to handle that directly in their
  own systems, and explain why when it comes up.

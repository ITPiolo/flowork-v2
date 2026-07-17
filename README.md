# flowork v2

A full rebuild of the flowork website — Next.js 16 + Tailwind + Framer
Motion + Supabase — replacing the previous Elementor/NameHero site with
a fully database-driven site and a comprehensive admin dashboard.

**Live (staging):** https://flowork-v2-gold.vercel.app
**Repo:** https://github.com/ITPiolo/flowork-v2

---

## What's built

### Public site
- Home, `/locations` index + `/locations/[slug]`, `/services/[slug]`,
  `/ejari`, `/blog` index + `/blog/[slug]`, `/about`, `/contact`, `/faqs`,
  `/privacy-policy`, `/terms`
- Rotating split-screen hero with auto-cycling photos
- Custom pages built via drag-and-drop (see Page Builder below) —
  rendered at `/[slug]`
- Public per-unit pages (`/units/[unitId]`) — safe, non-sensitive info
  only, used for QR codes at physical desks/offices
- 360° virtual tour (Pannellum) for Boardroom and Podcast Room
- Sitemap, robots.txt, structured data (JSON-LD), social share images
- Rate-limited enquiry form → Supabase `enquiries` table
- Newsletter signup → `newsletter_subscribers` table

### Admin dashboard (`/admin`, behind Supabase Auth)
- **Overview** — pipeline dashboard (win rate, stage breakdown, top
  requested services)
- **Pages** — drag-and-drop page builder (Puck), 15 content blocks,
  image uploads built in
- **Enquiries** — CRM pipeline (New → Contacted → Proposal Sent →
  Won/Lost), per-lead notes/activity log, CSV export with date/stage
  filters, email composer (HTML signature support)
- **Locations / Services / Blog / Ejari Pricing** — full CRUD, image
  upload wired into every image field
- **Media Library** — browse/reuse every uploaded image
- **Newsletter** — subscriber list, search, CSV export
- **Proposal Library** — upload/organize/tag existing proposal
  documents (PDF/Word) for quick reuse — deliberately does NOT auto-
  generate proposals; too much variation between client needs
- **Occupancy** — real floor plan for both locations with clickable
  hotspots (positioned from the original signin.flowork.ae system's
  real coordinate data), live status (Occupied/Expiring/Vacant),
  CSV import/export, QR code generation per unit, automated renewal
  check (`/api/check-renewals`, meant to run on a daily cron)
- **Integrations** — hub showing available lead sources (Meta,
  Property Finder, Bayut, M365 email) with setup notes and webhook
  URLs, ready to activate when credentials exist

---

## Setup

### 1. Supabase
1. Create a project at supabase.com
2. Run every `.sql` file in `/supabase` in the SQL Editor, in roughly
   this order: `schema.sql` → `pages_schema.sql` → `crm_schema.sql` →
   `proposal_library_schema.sql` → `occupancy_schema.sql` →
   `occupancy_hotspots_seed.sql` (or `occupancy_full_seed.sql`, which
   combines it with the location image/dimension updates) →
   `occupancy_specs_seed.sql`
3. Also run the `public_unit_info` view SQL (see comments in
   `app/units/[unitId]/page.tsx`) — required for QR codes to work
   without exposing tenant-confidential data
4. Create one user under **Authentication → Users** — this is your
   admin login, there's no public sign-up
5. Create two Storage buckets, both **public**: `media` (images) and
   `documents` (proposal files) — see storage policy SQL in
   `supabase/schema.sql` comments for the required upload permissions
6. Copy your Project URL + anon key into `.env.local` (see
   `.env.example`)

### 2. Local development
```bash
npm install
cp .env.example .env.local
# fill in your Supabase URL + anon key
npm run dev
```

### 3. Deploy (Vercel)
Push to GitHub, import into Vercel, add the same env vars. Auto-deploys
on every push to `main`.

**Do not run `npm audit fix --force`** — it will silently downgrade
Next.js to an incompatible ancient version. Plain `npm audit` (no
`--force`) is safe to check anytime.

---

## Environment variables

| Variable | Required for | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Everything | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everything | ✅ Set |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email composer, renewal alerts | ⏸️ Not yet — needs a Microsoft 365 app password |
| `CRON_SECRET` | Renewal check endpoint auth | ✅ Set |
| `LEADS_WEBHOOK_SECRET` | External lead intake (`/api/leads/[source]`) | ⏸️ Not yet — add when connecting Meta/Property Finder |
| `ANTHROPIC_API_KEY` | (Removed feature — no longer needed) | — |

---

## Known gaps / deliberately deferred

- **About page & FAQ**: FAQ content is now real (provided by the
  client). About page still has generic placeholder copy — needs a
  real rewrite with actual team/company specifics.
- **M365 SMTP**: email composer and renewal notifications are fully
  built but silent until real SMTP credentials are added.
- **Meta / Property Finder / Bayut lead integrations**: the intake
  endpoint and admin hub UI exist; the platform-side webhook setup
  (which requires access to those accounts) hasn't been done.
- **Stripe payments**: deferred at the client's request — revisit once
  ready to connect a real account. Virtual Office pricing currently
  links to placeholder Stripe payment links, not a real integration.
- **Domain cutover**: site is still on the `.vercel.app` URL. flowork.ae
  currently points at the old NameHero/WordPress site — cutover is a
  deliberate future step, not yet scheduled.
- **NameHero cPanel hosting**: explored as an alternative to Vercel;
  concluded Vercel's free Hobby tier already covers this project's
  needs at $0/month, so migrating would add complexity/risk without
  saving money. Revisit only if there's a reason beyond cost.

---

## Project structure notes

- `app/admin/(dashboard)/` — the parenthesized folder is a Next.js
  route group. It exists specifically so `/admin/login` sits *outside*
  the auth-gated layout, avoiding an infinite redirect loop (this was
  a real bug we hit and fixed — don't move pages out of this group
  without understanding why it's there).
- `proxy.ts` (project root) — this is `middleware.ts` renamed per
  Next.js 16's convention change. The exported function is named
  `proxy`, not `middleware`.
- `lib/puckConfig.tsx` — defines every block available in the page
  builder. Categorized into "Ready-made sections" (Hero, TextImage,
  Gallery, etc.) and "Individual elements" (Heading, Paragraph, Image,
  Button — independently movable for true freeform layout).
- Image fields across admin forms use `PuckImageField` — drag-and-drop
  upload to Supabase Storage, with a manual URL field as fallback.
# flowork v2

Next.js 16 + Tailwind + Framer Motion + Supabase rebuild of the flowork
Elementor/NameHero site. Content (locations, services, Ejari pricing,
blog, enquiries) is fully database-driven and editable from `/admin`.

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql` — this creates all
   tables, RLS policies, and seeds the existing flowork content
   (Dubai Hills, Vision Tower, the 5 services, 3 Ejari packages).
3. Go to **Authentication → Users** and manually create one user (your
   email + a password) — this is the account you'll log into `/admin`
   with. There's no public sign-up form by design.
4. Copy your Project URL and anon public key from **Project Settings →
   API**.
5. Upload real photography to **Storage** (create a `media` bucket, make
   it public) and paste the resulting URLs into the location/service
   rows via `/admin` or Table Editor. Until then, pages expect files at
   `/public/images/...` — replace with your own exports from the current
   site or new shoots.

## 2. Local setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel, add the two env vars from `.env.local`.
3. Deploy. Point your domain (flowork.ae) at Vercel once you're happy —
   keep NameHero running in parallel until DNS cuts over.

## What's built

- Public site: Home, `/locations` index + `/locations/[slug]`,
  `/services/[slug]`, `/ejari`, `/blog` index + `/blog/[slug]` — all
  pulling live from Supabase
- Enquiry form → `enquiries` table (shows up in `/admin/enquiries`
  instantly, with status tracking)
- Newsletter form → `newsletter_subscribers` table
- `/admin` dashboard behind Supabase Auth (email/password) with **full
  CRUD on all four content types**: Locations, Services, Ejari Pricing,
  and Blog (list → new → edit, each with its own form component in
  `components/admin/`). Enquiries are read + status-update only, by
  design — you don't want to be editing a submitted lead's contact
  details.
- Scroll-reveal on every section, animated count-up stats on location
  pages, magnetic hover on service cards, animated mobile menu
- Signature motion element: `components/ScrollSpine.tsx` — a vine that
  grows down the left edge as you scroll, tying into flowork's existing
  greenery/footer-line visual language

## What's left to wire up (next pass)

- Real photography (currently referencing `/public/images/*` paths —
  swap for Supabase Storage URLs, or paste real URLs into the admin
  forms once you've uploaded to a `media` bucket)
- Email notification on new enquiry (Resend, hook into
  `app/api/enquire/route.ts`)
- About, Contact, FAQs, Privacy, Terms — currently linked from the
  footer but not built
- Image upload widget in admin forms (currently URL-paste only — add
  `@supabase/storage-js` upload UI if you want drag-and-drop)
- A `staff` roles table if you ever need more than one admin tier
  (right now any authenticated Supabase user has full write access)

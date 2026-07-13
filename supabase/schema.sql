-- flowork v2 schema
-- Run in Supabase SQL editor, or via `supabase db push`

create extension if not exists "uuid-ossp";

-- ========== LOCATIONS ==========
create table locations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text not null,
  description text not null,
  hero_image_url text not null,
  offices_count text not null default '65+',
  coworking_count text not null default '40+',
  meeting_rooms_count text not null default '2+',
  phone_booths_count text not null default '4',
  podcast_rooms_count text not null default '1',
  address text not null,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========== SERVICES ==========
create table services (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text not null,
  hero_image_url text not null,
  perks text[] not null default '{}',
  feature_heading text not null,
  feature_body text not null,
  feature_image_url text not null,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========== PRICING PACKAGES (Ejari) ==========
create table pricing_packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_aed numeric not null,
  billing_period text not null default 'Per Year',
  features text[] not null default '{}',
  featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ========== BLOG ==========
create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  body text not null,
  cover_image_url text not null,
  category text not null default 'Business Centres',
  published_at timestamptz not null default now(),
  published boolean not null default true
);

-- ========== ENQUIRIES ==========
create table enquiries (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  service text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  company_name text,
  people_count text not null,
  location text not null,
  status text not null default 'new' check (status in ('new','contacted','closed'))
);

-- ========== NEWSLETTER ==========
create table newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz not null default now()
);
alter table newsletter_subscribers enable row level security;
create policy "public can subscribe" on newsletter_subscribers
  for insert with check (true);
create policy "staff read subscribers" on newsletter_subscribers
  for select using (auth.role() = 'authenticated');

-- ========== RLS ==========
alter table locations enable row level security;
alter table services enable row level security;
alter table pricing_packages enable row level security;
alter table blog_posts enable row level security;
alter table enquiries enable row level security;

-- Public (anon) can read published content only
create policy "public read published locations" on locations
  for select using (published = true);
create policy "public read published services" on services
  for select using (published = true);
create policy "public read pricing" on pricing_packages
  for select using (true);
create policy "public read published blog" on blog_posts
  for select using (published = true);

-- Anyone can INSERT an enquiry (the public form), nobody can read/update
-- except authenticated admins (handled via service role in admin routes).
create policy "public can submit enquiries" on enquiries
  for insert with check (true);

-- Authenticated staff (admin dashboard) get full access.
-- Simplest approach: require a Supabase Auth user for all writes/reads
-- beyond the anon policies above. Tighten further with a `staff` table
-- or custom claim if you need role-based access later.
create policy "staff full access locations" on locations
  for all using (auth.role() = 'authenticated');
create policy "staff full access services" on services
  for all using (auth.role() = 'authenticated');
create policy "staff full access pricing" on pricing_packages
  for all using (auth.role() = 'authenticated');
create policy "staff full access blog" on blog_posts
  for all using (auth.role() = 'authenticated');
create policy "staff full access enquiries" on enquiries
  for select using (auth.role() = 'authenticated');
create policy "staff update enquiries" on enquiries
  for update using (auth.role() = 'authenticated');

-- ========== SEED DATA (from the existing site) ==========
insert into locations (slug, name, tagline, description, hero_image_url, coworking_count, meeting_rooms_count, phone_booths_count, address, display_order) values
('dubai-hills', 'Dubai Hills', 'Business meets lifestyle',
 'Set within one of Dubai''s most prestigious master communities, flowork Dubai Hills combines business with lifestyle. Surrounded by green spaces, luxury residences, and world-class retail.',
 '/images/dubai-hills-hero.jpg', '40+', '2+', '4', 'Dubai Hills Estate, Business Park, Building 4, 7th Floor, Dubai, UAE', 1),
('vision-tower-business-bay', 'Business Bay – Vision Tower', 'The city''s business pulse',
 'At the iconic Vision Tower in Business Bay, flowork offers a workspace with unrivalled visibility and connectivity, directly linked to Sheikh Zayed Road.',
 '/images/vision-tower-hero.jpg', '50+', '2+', '3', 'Vision Tower, Business Bay, Dubai, UAE', 2);

insert into services (slug, name, tagline, hero_image_url, perks, feature_heading, feature_body, feature_image_url, display_order) values
('private-office', 'Private Office', 'Fully furnished offices for teams of all sizes',
 '/images/private-office-hero.jpg',
 array['Customisable workspaces for teams of all sizes','Flexible contracts that grow with your business','Everything''s included, from Wi-Fi to utilities and services','Wide range of professional workspaces available 24/7'],
 'Private Offices for Modern Businesses in Dubai',
 'Serviced offices provide small to medium-sized businesses and branch offices with the infrastructure typically associated with multinational corporations, without the overhead.',
 '/images/private-office-feature.jpg', 1),
('coworking', 'Coworking', 'Hot desks and dedicated desks',
 '/images/coworking-hero.jpg',
 array['Access to all facilities','Private phone booths','Super-fast WiFi','Flexible printing options','Meeting rooms and boardroom','Podcast room','Scalable office solutions','Community access'],
 'Flexible Coworking Space in Dubai',
 'flowork provides enterprise coworking spaces designed for corporations and businesses seeking the energy and convenience of a coworking environment.',
 '/images/coworking-feature.jpg', 2),
('meeting-room', 'Meeting Room', 'Private meeting rooms bookable by the hour',
 '/images/meeting-room-hero.jpg',
 array['Realtime booking','Advanced AV and video conferencing','Reliable high-speed internet','On-site IT support','Guest Wi-Fi','Professional receptionists'],
 'Premium Boardroom in Dubai',
 'Our meeting rooms and boardroom are designed to the highest standards of interior styling, equipped with the latest AV and conferencing technology.',
 '/images/meeting-room-feature.jpg', 3),
('virtual-office', 'Virtual Office', 'Elevate your business presence',
 '/images/virtual-office-hero.jpg',
 array['Access to meeting rooms','Podcast booking','Phone booth access','Coworking space access'],
 'A Prestigious Business Address',
 'Establish credibility with a flowork business address, mail handling, and access to meeting rooms whenever you need to meet in person.',
 '/images/virtual-office-feature.jpg', 4),
('podcast-room', 'Podcast Room', 'Dubai Hills'' first podcast studio',
 '/images/podcast-room-hero.jpg',
 array['Sony FX30 Cinema Camera','Rode RODECaster Pro II','Rode PODMIC Dynamic Broadcast Mics','Bestview Teleprompter','Customizable setups','Post-production services'],
 'Discover Dubai Hills'' First Podcast Studio',
 'Dubai''s first podcast room in Dubai Hills offers unmatched service quality, empowering podcasters with top-tier facilities.',
 '/images/podcast-room-feature.jpg', 5);

insert into pricing_packages (name, price_aed, features, featured, display_order) values
('Business Address with Ejari', 10000,
 array['12-month tenancy contract','Trade name activities confirmed','44 hours/month coworking lounge usage','Prestigious business address at Vision Tower','Mail management service','Printing facilities from every desk','On-site IT support team'], false, 1),
('Virtual Office with Ejari', 15999,
 array['12-month tenancy contract','1 day/month complimentary private office usage','Prestigious business address','Dedicated local telephone number','Dedicated receptionist to answer calls','Printing facilities from every desk'], true, 2),
('Flexi Desk with Ejari', 18900,
 array['12-month Ejari certificate','24/7 access to a flowork Flexi Desk','Printing facilities from every desk','Premium coffee and tea (complimentary)','Dedicated personal assistant'], false, 3);

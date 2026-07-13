-- Run this FIRST if you get "relation already exists" errors,
-- then re-run schema.sql fresh afterward.
-- Safe to run on a brand-new dev project with no real data.

drop table if exists enquiries cascade;
drop table if exists newsletter_subscribers cascade;
drop table if exists blog_posts cascade;
drop table if exists pricing_packages cascade;
drop table if exists services cascade;
drop table if exists locations cascade;

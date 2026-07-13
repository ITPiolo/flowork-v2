import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://flowork.ae"; // update this once you know the final domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: locations }, { data: services }, { data: posts }] =
    await Promise.all([
      supabase.from("locations").select("slug"),
      supabase.from("services").select("slug"),
      supabase.from("blog_posts").select("slug"),
    ]);

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/faqs",
    "/locations",
    "/blog",
    "/ejari",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const locationPages = (locations ?? []).map((l) => ({
    url: `${BASE_URL}/locations/${l.slug}`,
    lastModified: new Date(),
  }));

  const servicePages = (services ?? []).map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: new Date(),
  }));

  const blogPages = (posts ?? []).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...locationPages, ...servicePages, ...blogPages];
}
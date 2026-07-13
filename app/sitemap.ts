import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Location, Service, BlogPost } from "@/lib/supabase/types";

const BASE_URL = "https://flowork.ae"; // update this once you know the final domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: locations }, { data: services }, { data: posts }] =
    await Promise.all([
      supabase.from("locations").select("*"),
      supabase.from("services").select("*"),
      supabase.from("blog_posts").select("*"),
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

  const locationPages = ((locations ?? []) as Location[]).map((l) => ({
    url: `${BASE_URL}/locations/${l.slug}`,
    lastModified: new Date(),
  }));

  const servicePages = ((services ?? []) as Service[]).map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: new Date(),
  }));

  const blogPages = ((posts ?? []) as BlogPost[]).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...locationPages, ...servicePages, ...blogPages];
}
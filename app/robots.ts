import type { MetadataRoute } from "next";

const BASE_URL = "https://flowork.ae"; // update this once you know the final domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
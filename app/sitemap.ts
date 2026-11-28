import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://no-asteroids-achievement-tracker.vercel.app";
  return ["", "/about", "/privacy", "/disclaimer"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date("2026-11-28"),
    changeFrequency: path ? "yearly" : "weekly",
    priority: path ? 0.4 : 1,
  }));
}

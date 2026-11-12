import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { legal } from "@/content/legal";
import { getProjects } from "@/lib/content/projects";

/**
 * Every indexable page. Case studies come from content/projects, so adding a
 * project adds its URL here with no edit.
 *
 * /privacy is left out while its body is empty — that page is noindex until
 * the policy is written, and a sitemap should not contradict that.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/work`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/about`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.7 },
  ];

  const caseStudies: MetadataRoute.Sitemap = getProjects().map((p) => ({
    url: `${site.url}/work/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  if (legal.privacy.body.trim()) {
    pages.push({ url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.3 });
  }

  return [...pages, ...caseStudies].map((entry) => ({ lastModified: now, ...entry }));
}

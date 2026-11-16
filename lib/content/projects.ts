/**
 * Reads every project from content/projects/*.mdx.
 *
 * Adding a project is one MDX file plus a folder of images under
 * /public/work/<slug>/ — no component changes. The slug is the filename.
 *
 * Server-only: this touches the filesystem, so import it from server
 * components, route handlers, sitemap or metadata — never from a "use client"
 * file.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseOrThrow, projectSchema, type Platform, type Project, type ProjectType } from "./schema";

const DIR = path.join(process.cwd(), "content", "projects");

function read(): Project[] {
  if (!fs.existsSync(DIR)) {
    throw new Error(`Missing content directory: ${path.relative(process.cwd(), DIR)}`);
  }

  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
  if (files.length === 0) throw new Error(`No .mdx projects found in ${DIR}`);

  const projects = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const { data, content } = matter(raw);
    const frontmatter = parseOrThrow(projectSchema, data, `content/projects/${file}`);
    const body = content.trim();
    // A body that is only comments has nothing to show, so the page hides the
    // "problem" section rather than rendering an empty heading.
    const hasBody = body.replace(/<!--[\s\S]*?-->/g, "").trim().length > 0;
    // A case study needs something under the header to be worth opening. With
    // none of these the page would repeat the card, so the project gets no
    // page, no link and no sitemap entry until one of them is filled in.
    const hasCaseStudy =
      hasBody ||
      frontmatter.features.length > 0 ||
      frontmatter.gallery.length > 0 ||
      frontmatter.results.length > 0 ||
      frontmatter.stack.length > 0 ||
      Boolean(frontmatter.quote);
    return { ...frontmatter, slug, body, hasBody, hasCaseStudy };
  });

  const slugs = new Set<string>();
  for (const p of projects) {
    if (slugs.has(p.slug)) throw new Error(`Duplicate project slug: ${p.slug}`);
    slugs.add(p.slug);
  }

  // Lowest `order` first; ties fall back to title so the grid is stable.
  return projects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

let cached: Project[] | undefined;

/**
 * In production the files are read and validated once per build, so a schema
 * error fails `next build`. In development nothing is cached, so editing an
 * .mdx file shows up on the next request without restarting the dev server.
 */
export function getProjects(): Project[] {
  if (process.env.NODE_ENV !== "production") return read();
  cached ??= read();
  return cached;
}

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug);

export const getFeatured = (limit = 3) =>
  getProjects().filter((p) => p.featured).slice(0, limit);

/** Only the projects with a page: what generateStaticParams and the sitemap use. */
export const getCaseStudies = () => getProjects().filter((p) => p.hasCaseStudy);

export const getProjectSlugs = () => getCaseStudies().map((p) => p.slug);

/** Only the platforms and types actually used, so filters never show a dead option. */
export const usedPlatforms = (): Platform[] =>
  [...new Set(getProjects().flatMap((p) => p.platforms))];

export const usedTypes = (): ProjectType[] => [
  ...new Set(getProjects().map((p) => p.type).filter((t): t is ProjectType => Boolean(t))),
];

/** Numeric App Store id, for the build-time ratings lookup. Undefined when there is no listing. */
export function appStoreId(project: Project): string | undefined {
  return project.links.appStore?.match(/\/id(\d+)/)?.[1];
}

/**
 * The project after this one, wrapping around, for the "next project" link.
 * Only projects with a page of their own are in the chain — the link would
 * otherwise lead to a 404.
 */
export function nextProject(slug: string): Project | undefined {
  const all = getCaseStudies();
  if (all.length < 2) return undefined;
  const i = all.findIndex((p) => p.slug === slug);
  return i === -1 ? undefined : all[(i + 1) % all.length];
}

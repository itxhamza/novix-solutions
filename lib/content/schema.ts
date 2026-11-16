/**
 * Schemas for everything under /content.
 *
 * Every content file is parsed through one of these at build time. A missing
 * or malformed required field throws, which fails `next build` rather than
 * shipping a half-empty page.
 *
 * Optional fields follow one rule: absent or empty means "not known yet", and
 * the page hides that element entirely. Nothing is ever filled with a
 * placeholder — see docs/CONTENT.md.
 */
import { z } from "zod";

export const PLATFORMS = ["iOS", "Android", "Web"] as const;
export const PROJECT_TYPES = ["New build", "Rescue", "Dedicated team"] as const;

export type Platform = (typeof PLATFORMS)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];

/** "" and whitespace collapse to undefined so the renderer can just check for falsy. */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());
const optionalUrl = z.preprocess(blankToUndefined, z.url().optional());

const image = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** Phone shots render in a device frame, web shots in a browser frame. */
const galleryImage = image.extend({ frame: z.enum(["phone", "browser"]) });

/** Only ever populated with numbers the client actually gave us. */
const metric = z.object({ label: z.string().min(1), value: z.string().min(1) });

/** All three parts are required together — a quote with no attribution is not publishable. */
const quote = z.object({
  text: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  thumbnail: image,

  // Everything below is optional: empty means the element is hidden.
  /** Drives the type filter on /work. A project without one is skipped by that filter. */
  type: z.preprocess(blankToUndefined, z.enum(PROJECT_TYPES).optional()),
  year: optionalText,
  role: optionalText,
  client: optionalText,
  /** One-line outcome on the work card. Falls back to `summary` while empty. */
  result: optionalText,
  links: z
    .object({ appStore: optionalUrl, googlePlay: optionalUrl, website: optionalUrl })
    .default({}),
  features: z.array(z.string().min(1)).default([]),
  stack: z.array(z.string().min(1)).default([]),
  gallery: z.array(galleryImage).default([]),
  results: z.array(metric).default([]),
  quote: quote.optional(),

  featured: z.boolean().default(false),
  order: z.number().int().default(999),
});

export const serviceSchema = z.object({
  id: z.string().min(1),
  tag: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  /** Doubles as the "what's included" list on /services. */
  points: z.array(z.string().min(1)).min(1),
  /** Long-form fields for /services. Empty ones are hidden. */
  forWho: optionalText,
  pricing: optionalText,
  /** Slugs of projects to show as proof under this service. */
  caseStudies: z.array(z.string().min(1)).default([]),
  demoLabel: optionalText,
  demoBroken: optionalText,
  demoFixed: optionalText,
});

export const processStepSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  /** What the client actually receives at this step. Hidden while empty. */
  deliverables: z.array(z.string().min(1)).default([]),
});

export const testimonialSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  /** Hidden while empty. */
  company: optionalText,
  photo: optionalText,
  /** Nothing renders until this is true — consent before publication. */
  approved: z.boolean().default(false),
  /** Slug of the project it belongs to, when it came from one. */
  project: optionalText,
});

export const sectionSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
});

export type Project = z.infer<typeof projectSchema> & {
  slug: string;
  body: string;
  /** False when the MDX body is empty or only comments. */
  hasBody: boolean;
  /**
   * False when the case study page would be its header and nothing else. Such
   * a project still appears on /work, but as a plain tile: no link, no page.
   */
  hasCaseStudy: boolean;
};
export type Service = z.infer<typeof serviceSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;

/**
 * Parse with a message that names the file and the exact failing field, so a
 * build failure tells you what to fix without opening the schema.
 */
export function parseOrThrow<T extends z.ZodType>(schema: T, data: unknown, source: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid content in ${source}:\n${issues}`);
  }
  return result.data;
}

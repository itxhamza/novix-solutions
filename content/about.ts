/**
 * /about copy.
 *
 * The team fields are intentionally empty — the page hides whatever has no
 * value, so nothing is invented about who runs Novix.
 */
import { parseOrThrow, sectionSchema } from "@/lib/content/schema";
import { z } from "zod";

export const aboutSection = parseOrThrow(
  sectionSchema,
  {
    eyebrow: "About",
    title: "A small team in Lahore, building for the US and the Gulf.",
    intro:
      "Novix Solutions is a software agency in Lahore, Pakistan. We build and rescue iOS, Android and web apps for growing businesses.",
  },
  "content/about.ts → aboutSection",
);

const personSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().default(""),
});

/**
 * FILL ME IN. Each entry needs at least a name and a role; the team section
 * does not render while this is empty.
 */
export const team = parseOrThrow(z.array(personSchema), [], "content/about.ts → team");

/** Factual, from how the agency already describes itself. No claims added. */
export const howWeWork = [
  {
    title: "Where we are",
    body: "Lahore, Pakistan. We work with clients across the United States and the Gulf.",
  },
  {
    title: "Overlap hours",
    body: "Our day overlaps with US time zones, so there is a window every working day when you can reach us live rather than waiting on a handover.",
  },
  {
    title: "How we engage",
    body: "Scope agreed in writing, milestone-based payment, short progress updates every few days, and support after launch.",
  },
];

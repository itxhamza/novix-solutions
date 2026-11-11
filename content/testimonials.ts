/**
 * Real client quotes only.
 *
 * This list is intentionally empty: the previous placeholder testimonial was
 * removed. Every testimonial block on the site renders only when this array
 * has an entry, so adding one here makes it appear and nothing else changes.
 *
 * Shape: { text, name, role, project? } — all of text/name/role are required,
 * because an unattributed quote is not publishable. `project` is a project
 * slug when the quote came from one.
 */
import { parseOrThrow, testimonialSchema } from "@/lib/content/schema";
import { z } from "zod";

export const testimonials = parseOrThrow(
  z.array(testimonialSchema),
  [],
  "content/testimonials.ts → testimonials",
);

export const hasTestimonials = testimonials.length > 0;

/** The quote to show on the home page, or undefined to hide the block. */
export const featuredTestimonial = testimonials[0];

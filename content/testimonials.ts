/**
 * Real client quotes only.
 *
 * `approved` is the publication gate: an entry renders nowhere on the site
 * until it is true. Set it only once the person has agreed to be quoted.
 * Empty optional fields (company, photo) are hidden rather than filled in.
 */
import { parseOrThrow, testimonialSchema } from "@/lib/content/schema";
import { z } from "zod";

export const testimonials = parseOrThrow(
  z.array(testimonialSchema),
  [
    {
      quote:
        "Hamza built both our mobile app and our web platform, end to end. He understood what we needed faster than teams I'd worked with before, communicated constantly, and delivered working software on every milestone. I'd work with him again without hesitation.",
      name: "Anthony",
      role: "Founder",
      /** FILL ME IN — the company line is hidden while this is empty. */
      company: "",
      photo: "",
      approved: true,
    },
  ],
  "content/testimonials.ts → testimonials",
);

/** The only list any component should read. */
export const approvedTestimonials = testimonials.filter((t) => t.approved);

export const hasTestimonials = approvedTestimonials.length > 0;

/** The quote to show on the home page, or undefined to hide the block. */
export const featuredTestimonial = approvedTestimonials[0];

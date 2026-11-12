/**
 * "What you get every week" — one project week, as three fixed points.
 *
 * NOTE: content/process.ts promises "a live demo every two weeks". The Friday
 * stop below says every week. Reconcile the two before publishing.
 */
import { parseOrThrow, sectionSchema } from "@/lib/content/schema";
import { z } from "zod";

export const weeklySection = parseOrThrow(
  sectionSchema,
  {
    eyebrow: "Every week",
    title: "What you get every week.",
    intro: "The same three fixed points on every project, so you are never waiting to find out where things stand.",
  },
  "content/weekly.ts → weeklySection",
);

const stopSchema = z.object({
  when: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const weeklyStops = parseOrThrow(
  z.array(stopSchema).min(1),
  [
    {
      when: "Monday",
      title: "Scope check-in",
      body: "We agree what the week covers and what it does not, in writing.",
    },
    {
      when: "Mid-week",
      title: "Progress update",
      body: "A short written update on what has moved, and anything that is blocked.",
    },
    {
      when: "Friday",
      title: "Demo",
      body: "You see the week's work running, not a description of it.",
    },
  ],
  "content/weekly.ts → weeklyStops",
);

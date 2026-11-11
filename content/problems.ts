/**
 * "Why teams come to us" — the situation a client arrives with, and the short
 * answer for how it is handled. Answers stay consistent with content/process.ts.
 */
import { parseOrThrow, sectionSchema } from "@/lib/content/schema";
import { z } from "zod";

export const problemsSection = parseOrThrow(
  sectionSchema,
  {
    eyebrow: "Why teams come to us",
    title: "The four conversations we have most.",
    intro: "If one of these sounds like your project, it is the kind of work we do every week.",
  },
  "content/problems.ts → problemsSection",
);

const problemSchema = z.object({
  problem: z.string().min(1),
  answer: z.string().min(1),
});

export const problems = parseOrThrow(
  z.array(problemSchema).min(1),
  [
    {
      problem: "The app is half-built and the team went quiet",
      answer:
        "We audit what exists and tell you what is salvageable. Then we finish it against a written scope, so there is a date and a number attached.",
    },
    {
      problem: "Every fix breaks something else",
      answer:
        "We stabilise before we add anything. The code gets cleaned up and handed back in a state your next developer can work in.",
    },
    {
      problem: "We can't get a straight answer on cost or timeline",
      answer:
        "Scope is agreed in writing before any code. You pay per milestone, after you have seen that milestone working.",
    },
    {
      problem: "Our developers are stretched and the release is slipping",
      answer:
        "Senior React Native and Node.js developers plug into your team, your repo and your process, for as long as you need them.",
    },
  ],
  "content/problems.ts → problems",
);

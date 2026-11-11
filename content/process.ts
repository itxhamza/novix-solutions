/**
 * The four process steps. `deliverables` ("what the client receives at this
 * step") is empty until the real list exists; /process hides empty ones.
 */
import { parseOrThrow, processStepSchema, sectionSchema } from "@/lib/content/schema";
import { z } from "zod";

export const processSection = parseOrThrow(
  sectionSchema,
  {
    eyebrow: "How we work",
    title: "No surprises. Four steps.",
    intro: "The same process on every project, written down before we start.",
  },
  "content/process.ts → processSection",
);

export const processSteps = parseOrThrow(
  z.array(processStepSchema).min(1),
  [
    {
      icon: "scope",
      title: "Scope agreed in writing",
      body: "Before any code, you get a written scope: what we build, what we don't, and what it costs.",
      deliverables: [],
    },
    {
      icon: "milestone",
      title: "Milestone-based payment",
      body: "Work is split into milestones. You pay after you see each one working.",
      deliverables: [],
    },
    {
      icon: "updates",
      title: "Updates every few days",
      body: "Short progress updates every few days, and a live demo every two weeks.",
      deliverables: [],
    },
    {
      icon: "support",
      title: "Support after launch",
      body: "We stay on after release for fixes, store updates and the next round of features.",
      deliverables: [],
    },
  ],
  "content/process.ts → processSteps",
);

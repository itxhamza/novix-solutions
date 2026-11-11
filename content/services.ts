/**
 * The three services. Validated at import time by lib/content/schema.ts.
 *
 * `forWho` and `caseStudies` are empty until the real answers exist — the
 * /services page hides whichever are blank.
 */
import { parseOrThrow, sectionSchema, serviceSchema } from "@/lib/content/schema";
import { z } from "zod";

/** True for every project, so each service repeats it. No figures anywhere. */
const MILESTONE_PRICING =
  "Milestone-based. Work is split into milestones, and you pay after you see each one working.";

export const servicesSection = parseOrThrow(
  sectionSchema,
  {
    eyebrow: "Services",
    title: "Three ways we work with you.",
    intro: "Pick the one that matches where your product is today.",
  },
  "content/services.ts → servicesSection",
);

export const services = parseOrThrow(
  z.array(serviceSchema).min(1),
  [
    {
      id: "build",
      tag: "Build",
      title: "New mobile & web apps",
      body: "From first screen to store listing. One team covers the whole product, so nothing falls between vendors.",
      points: ["iOS & Android", "Web", "Backend", "Payments", "App store launch"],
      demoLabel: "Assembling build",
      forWho: "",
      pricing: MILESTONE_PRICING,
      caseStudies: [],
    },
    {
      id: "rescue",
      tag: "Rescue",
      title: "App rescue & takeover",
      body: "Buggy or half-finished app? We take it over, audit the code, stabilize it, and finish it.",
      points: ["Code audit", "Stabilize", "Finish", "Hand back clean"],
      demoLabel: "Fixing errors",
      demoBroken: "errors",
      demoFixed: "All clear",
      forWho: "",
      pricing: MILESTONE_PRICING,
      caseStudies: [],
    },
    {
      id: "team",
      tag: "Extend",
      title: "Dedicated developers",
      body: "Senior React Native and Node.js developers who plug into your team, your repo and your process, with overlap hours for US time zones.",
      points: ["React Native", "Node.js", "Your repo", "US overlap hours"],
      demoLabel: "In sync",
      demoFrom: { label: "Your team", time: "9:00 AM · New York" },
      demoTo: { label: "Novix", time: "7:00 PM · Lahore" },
      forWho: "",
      pricing: MILESTONE_PRICING,
      caseStudies: [],
    },
  ],
  "content/services.ts → services",
);

export const getService = (id: string) => services.find((s) => s.id === id);

/**
 * /about copy. Edit here; the page reads everything from this file.
 *
 * Empty fields are hidden rather than rendered: no brackets, no placeholder
 * text, and no invented numbers, names or links ever reach a visitor.
 * Fields marked FILL ME IN are the ones still waiting on a real value.
 */
import { z } from "zod";
import { parseOrThrow } from "@/lib/content/schema";
import { site } from "@/content/site";

const personSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().default(""),
  photo: z.string().default(""),
});

const statSchema = z.object({
  /** Empty hides this stat. The whole strip hides when none are filled. */
  value: z.string(),
  label: z.string().min(1),
});

export const about = {
  hero: {
    eyebrow: "About Novix",
    headline: "A small team that finishes what it starts.",
    subline:
      "Novix Solutions is a software studio. We build mobile and web apps for businesses in the US and the Gulf, and we take over apps that other teams left unfinished.",
  },

  story: {
    heading: "Why Novix exists",
    /**
     * FILL ME IN — e.g. "8". While this is empty the opening sentence reads
     * "...who has spent years building...", with no number claimed.
     */
    years: "",
    /** `{years}` is replaced below; the token disappears when `years` is empty. */
    paragraphs: [
      "Novix was started by Hamza Javed, a software engineer who has spent {years}years building and shipping mobile apps end to end: the app, the backend behind it, payments, and the release to the App Store and Google Play.",
      "Working with clients over those years, the same story kept coming up. A business pays for an app, the project drags on, the bugs pile up, and the team that built it goes quiet. The app is 60% done and nobody can say when it will be finished.",
      "Novix was set up to be the opposite of that. Scope is agreed in writing. You pay for milestones you have seen working. You hear from us every few days, whether the news is good or bad.",
    ],
  },

  whatWeDo: {
    heading: "Three things, done properly",
    items: [
      {
        title: "New apps",
        body: "iOS, Android and web, from the first screen to the store listing.",
      },
      {
        title: "App rescue",
        body: "we audit a buggy or half-built app, stabilise it, and finish it.",
      },
      {
        title: "Dedicated developers",
        body: "senior React Native and Node.js developers who work inside your team and your process.",
      },
    ],
    link: { label: "See our services", href: "/services" },
  },

  howWeWork: {
    heading: "What working with us is like",
    points: [
      "Written scope before any work starts, so the cost and the deliverables are never a surprise.",
      "Milestone payments: you pay after you have seen each piece working.",
      "A short update every few days and a live demo every two weeks.",
      "You own the code. It lives in your repository from day one.",
      "We tell you when an idea is a bad one, and what we would do instead.",
    ],
    link: { label: "See the full process", href: "/#process" },
  },

  founder: {
    heading: "Who you will be talking to",
    name: "Hamza Javed",
    role: "CEO & Founder",
    bio: "Hamza leads every project personally. He works across the whole stack: React Native apps, Node.js backends, in-app payments and subscriptions, and the servers they run on. When you message Novix, you are talking to the person responsible for your code.",
    /**
     * Save the portrait as public/team/hamza.png and it appears automatically.
     * The About page checks the file exists before rendering it, so a missing
     * file hides the photo instead of showing a broken image.
     */
    photo: "/team/hamza.png",
    photoAlt: "Hamza Javed, CEO and founder of Novix Solutions",
    /** FILL ME IN — full LinkedIn profile URL. Hidden while empty. */
    linkedin: "",
  },

  /** FILL ME IN — the team section renders as soon as this has an entry. */
  team: [] as z.infer<typeof personSchema>[],

  cta: {
    heading: "Have an app that needs building, or fixing?",
    body: "Send us a few lines about it. We reply within one business day.",
    primary: "Book a call",
    secondary: "Email us",
  },
} as const;

export const aboutTeam = parseOrThrow(
  z.array(personSchema),
  about.team,
  "content/about.ts → team",
);

/** Shared with the home page: the single set of counters lives in site.ts. */
export const aboutNumbers = parseOrThrow(
  z.array(statSchema),
  site.stats,
  "content/site.ts → stats",
).filter((n) => n.value.trim());

/** Swaps `{years}` for the real figure, or drops it when none is set. */
export function storyParagraphs(): string[] {
  const years = about.story.years.trim();
  return about.story.paragraphs.map((p) => p.replace("{years}", years ? `${years} ` : ""));
}

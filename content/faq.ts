/**
 * Home-page FAQ. Answers stay consistent with content/process.ts and
 * content/services.ts — nothing here promises anything they do not.
 *
 * NOTE: the brief also asked for "What time zones do you cover?". It is left
 * out because the site no longer mentions hours or locations. Add it back here
 * and it will appear in both the accordion and the FAQ structured data.
 */
import { parseOrThrow, sectionSchema } from "@/lib/content/schema";
import { z } from "zod";

export const faqSection = parseOrThrow(
  sectionSchema,
  {
    eyebrow: "FAQ",
    title: "Questions we get asked first.",
    intro: "If yours is not here, send it over and we will answer it directly.",
  },
  "content/faq.ts → faqSection",
);

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const faqs = parseOrThrow(
  z.array(faqSchema).min(1),
  [
    {
      question: "How do milestone payments work?",
      answer:
        "Work is split into milestones that are agreed in writing before anything starts. You see each milestone working, and you pay for it after that, not before.",
    },
    {
      question: "Who owns the code?",
      answer:
        "You do. It lives in your repository from day one, so you are never waiting on us to hand anything over.",
    },
    {
      question: "Can you take over an app built by another team?",
      answer:
        "Yes, that is a large part of what we do. We audit the existing code, tell you what is worth keeping, stabilise it, and then finish it.",
    },
    {
      question: "What stack do you use?",
      answer:
        "React Native for iOS and Android, Node.js and TypeScript on the backend, PostgreSQL or MongoDB for data, AWS or Firebase to run it, and Stripe for payments.",
    },
    {
      question: "How quickly do you start?",
      answer:
        "Send us a few lines about the project and we come back with a written scope. Work starts as soon as that scope is agreed.",
    },
  ],
  "content/faq.ts → faqs",
);

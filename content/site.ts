/**
 * ALL SITE COPY LIVES HERE.
 * Edit text, links, projects and the testimonial in this file — no component
 * needs to change. Animation timings live in lib/animations.ts.
 */

const whatsappNumber = "923054668401"; // digits only, with country code
const whatsappMessage = "Hi Novix, I'd like to book a call about my app.";
const email = "info@novixsolutions.com";

export const site = {
  name: "Novix Solutions",
  shortName: "Novix",
  url: "https://novixsolutions.com",
  location: "Lahore, Pakistan",

  seo: {
    title: "Novix Solutions — We build and rescue mobile apps",
    description:
      "Novix Solutions is a software agency in Lahore building and rescuing iOS, Android and web apps for growing businesses in the US and the Gulf. Backend, payments and launch included.",
    ogAlt: "Novix Solutions — we build and rescue mobile apps for growing businesses",
  },

  contact: {
    email,
    emailHref: `mailto:${email}`,
    whatsappDisplay: "+92 305 4668401",
    whatsappHref: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
  },

  nav: [
    { label: "Services", href: "#services" },
    { label: "How we work", href: "#process" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
  ],

  // Text shown inside the custom cursor when it is over a call-to-action.
  cursorLabel: "Let's talk",

  hero: {
    eyebrow: "Software agency · Lahore → US & Gulf",
    headline: "We build and rescue mobile apps for growing businesses.",
    // Words from the headline that get the accent colour.
    headlineAccent: ["rescue"],
    subline:
      "We ship iOS, Android and web apps end to end, with the backend and deployment handled for you.",
    primaryCta: "Book a call",
    secondaryCta: "Email us",
    statusLabel: "Status",
    statusBroken: "Repairing",
    statusFixed: "Repaired",
    scrollHint: "Scroll",
  },

  services: {
    eyebrow: "Services",
    title: "Three ways we work with you.",
    intro: "Pick the one that matches where your product is today.",
    items: [
      {
        id: "build",
        tag: "Build",
        title: "New mobile & web apps",
        body: "From first screen to store listing. One team covers the whole product, so nothing falls between vendors.",
        points: ["iOS & Android", "Web", "Backend", "Payments", "App store launch"],
        demoLabel: "Assembling build",
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
      },
    ],
  },

  process: {
    eyebrow: "How we work",
    title: "No surprises. Four steps.",
    intro: "The same process on every project, written down before we start.",
    steps: [
      {
        icon: "scope",
        title: "Scope agreed in writing",
        body: "Before any code, you get a written scope: what we build, what we don't, and what it costs.",
      },
      {
        icon: "milestone",
        title: "Milestone-based payment",
        body: "Work is split into milestones. You pay after you see each one working.",
      },
      {
        icon: "updates",
        title: "Updates every few days",
        body: "Short progress updates every few days, and a live demo every two weeks.",
      },
      {
        icon: "support",
        title: "Support after launch",
        body: "We stay on after release for fixes, store updates and the next round of features.",
      },
    ],
  },

  work: {
    eyebrow: "Work",
    title: "Recent projects.",
    intro: "A few of the products we have shipped.",
    visitLabel: "View",
    // image: file in /public/work. Set image to "" to show an empty screenshot slot.
    projects: [
      {
        title: "Bynaus.ai",
        tag: "Web app",
        description: "AI-agent workspace for operations teams: people, projects, timesheets and boards in one place.",
        image: "/work/bynaus.webp",
        imageWidth: 2000,
        imageHeight: 1159,
        href: "https://app.bynaus.ai/login",
      },
      {
        title: "Bizly",
        tag: "iOS & Android",
        description: "Creative network and jobs app connecting freelancers with the people hiring them.",
        image: "/work/bizly.webp",
        imageWidth: 604,
        imageHeight: 560,
        href: "https://apps.apple.com/us/app/bizly-creative-network-jobs/id6443831329",
      },
      {
        title: "Easy HVAC",
        tag: "iOS & Android",
        description: "Service requests for HVAC contractors, tracked from fault report to payment.",
        image: "/work/easy-hvac.webp",
        imageWidth: 430,
        imageHeight: 560,
        href: "",
      },
    ],
    // PLACEHOLDER — replace with a real client quote.
    testimonial: {
      quote:
        "Placeholder quote. Replace this with a short client testimonial about what Novix delivered and how the project went.",
      name: "Client name",
      role: "Role, Company",
    },
  },

  contactSection: {
    eyebrow: "Contact",
    title: "Tell us what's broken, or what's next.",
    intro: "Send a few lines about your app. We reply within one business day.",
    whatsappLabel: "WhatsApp",
    emailLabel: "Email",
    locationLabel: "Based in",
    form: {
      name: "Name",
      email: "Email",
      message: "Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@company.com",
      messagePlaceholder: "What are you building, or what needs fixing?",
      submit: "Send message",
      sending: "Sending",
      success: "Message sent. We'll reply within one business day.",
      error: "Couldn't send your message. Please try again, or use WhatsApp or email instead.",
      invalid: "Please fill in your name, a valid email and a message.",
    },
  },

  footer: {
    line: "We build and rescue mobile apps.",
    social: [
      { label: "LinkedIn", href: "https://linkedin.com/company/novixsolutions" },
      { label: "X", href: "https://x.com/novixsolutions" },
      { label: "Instagram", href: "https://www.instagram.com/novixsolutions/" },
      { label: "Facebook", href: "https://www.facebook.com/people/Novix-Solutions/61586626263982/" },
    ],
  },
} as const;

export type Site = typeof site;

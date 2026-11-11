/**
 * SITE SETTINGS — identity, contact details, navigation, brand assets and the
 * copy for sections that have no content file of their own.
 *
 * The rest of the content lives beside this file:
 *   content/projects/*.mdx   one file per project
 *   content/services.ts      the three services
 *   content/process.ts       the four process steps
 *   content/testimonials.ts  real client quotes (empty until one exists)
 *
 * Animation timings live in lib/animations.ts.
 */

const email = "info@novixsolutions.com";
const booking = "https://calendly.com/itxhamzajaved-work/30min";

export const site = {
  name: "Novix Solutions",
  shortName: "Novix",
  url: "https://novixsolutions.com",

  seo: {
    title: "Novix Solutions — We build and rescue mobile apps",
    description:
      "Novix Solutions is a software agency building and rescuing iOS, Android and web apps for growing businesses in the US and the Gulf. Backend, payments and launch included.",
    ogAlt: "Novix Solutions — we build and rescue mobile apps for growing businesses",
  },

  /** Files in /public/brand. See public/brand for the full pack. */
  brand: {
    headerLogo: "/brand/novix-logotype-dark.svg",
    footerLogo: "/brand/novix-logotype-dark.svg",
    mark: "/brand/novix-mark-on-dark.svg",
    ogFallback: "/brand/novix-app-icon-dark-512.png",
  },

  contact: {
    email,
    emailHref: `mailto:${email}`,
    /** Every "Book a call" and "Schedule a call" button. */
    bookingHref: booking,
  },

  /** Header and footer navigation. Portfolio first. */
  nav: [
    { label: "Work", href: "/work" },
    { label: "Services", href: "/services" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  /** Text inside the custom cursor over a call-to-action, and where it goes. */
  cursorLabel: "Let's talk",
  cursorHref: "/contact",

  hero: {
    eyebrow: "Software agency · US & Gulf",
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

  /**
   * Counters on the home page and /about. A counter renders only once its
   * value is set, and the strip hides entirely while all four are empty.
   * FILL ME IN — no figure here is a guess.
   */
  stats: [
    { value: "", label: "apps shipped" },
    { value: "", label: "years building mobile apps" },
    { value: "", label: "countries with clients" },
    { value: "", label: "average first-reply time" },
  ],

  /** Section copy for the work grid. The projects come from content/projects. */
  workSection: {
    eyebrow: "Work",
    title: "Recent projects.",
    intro: "A few of the products we have shipped.",
    visitLabel: "View",
  },

  contactSection: {
    eyebrow: "Contact",
    title: "Tell us what's broken, or what's next.",
    intro: "Send a few lines about your app. We reply within one business day.",
    emailLabel: "Email",
    /** Secondary CTA next to the form link; opens the Calendly booking page. */
    scheduleCta: "Schedule a call",
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
      error: "Couldn't send your message. Please try again, or email us instead.",
      invalid: "Please fill in your name, a valid email and a message.",
    },
  },

  footer: {
    line: "We build and rescue mobile apps.",
    // Only real URLs belong here; the footer renders whatever is in this list.
    social: [
      { label: "LinkedIn", href: "https://linkedin.com/company/novixsolutions" },
      { label: "X", href: "https://x.com/novixsolutions" },
      { label: "Instagram", href: "https://www.instagram.com/novixsolutions/" },
      { label: "Facebook", href: "https://www.facebook.com/people/Novix-Solutions/61586626263982/" },
    ],
  },
} as const;

export type Site = typeof site;

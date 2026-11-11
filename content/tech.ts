/**
 * Technology strip under the hero.
 *
 * `logo` is optional: drop a monochrome SVG in /public/tech/ and point to it,
 * and the wordmark is replaced by the image. Until then each item renders as
 * its name, so nothing ships as a broken or guessed-at logo.
 */
export type Tech = { name: string; logo?: string };

export const tech: Tech[] = [
  { name: "React Native" },
  { name: "Node.js" },
  { name: "TypeScript" },
  { name: "PostgreSQL" },
  { name: "MongoDB" },
  { name: "AWS" },
  { name: "Firebase" },
  { name: "Stripe" },
  { name: "Apple App Store" },
  { name: "Google Play" },
];

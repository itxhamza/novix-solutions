# Novix Solutions — novixsolutions.com

Single-page marketing site. Next.js (App Router) + TypeScript + Tailwind CSS v4 + GSAP, deployed on Vercel.

## Where things live

| I want to change… | Edit |
| --- | --- |
| Any text, links, projects, the testimonial | `content/site.ts` |
| Animation timings, distances, easing | `TIMING` at the top of `lib/animations.ts` |
| Colours, font sizes, spacing | `@theme` block at the top of `app/globals.css` |
| Project screenshots | drop files in `public/work/`, reference them in `content/site.ts` |
| Favicon / touch icon | `app/icon.svg`, `app/apple-icon.png` |
| Where form emails go | environment variables (below) |

```
app/                 layout (meta, fonts), page, API route, OG image, robots, sitemap
components/          one file per section; markup only
content/site.ts      all copy
lib/animations.ts    every animation on the site
```

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without email keys, form submissions in dev are printed to the terminal instead of sent.

## Contact form email

The form posts to `app/api/contact/route.ts`, which sends the message through [Resend](https://resend.com). No database.

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | API key from Resend |
| `CONTACT_TO_EMAIL` | inbox that receives enquiries (private; never rendered on the site) |
| `CONTACT_FROM_EMAIL` | optional sender, e.g. `Novix Website <hello@novixsolutions.com>` once the domain is verified in Resend |

Until the domain is verified in Resend, the default sender (`onboarding@resend.dev`) only delivers to the email address the Resend account was created with.

## Deploy

1. Import the repo at https://vercel.com/new (framework is detected automatically).
2. Add the environment variables above under Project → Settings → Environment Variables.
3. Project → Settings → Domains → add `novixsolutions.com` and `www.novixsolutions.com`, then set the DNS records Vercel shows at your registrar.

## Motion and accessibility

- The HTML renders in its finished state; animations only animate *from* something, so a failed script never hides content.
- `prefers-reduced-motion` gets a fully static page (no loader, no pinning, no cursor).
- The services section pins and scrolls horizontally from 900px up; below that the panels stack.
- Old URLs (`/services`, `/work`, `/about`, `/contact`) redirect to the matching section — see `next.config.ts`.

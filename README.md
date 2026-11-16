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

## Contact form

The form posts to `app/api/contact/route.ts`, which does two things with a
submission: writes it to Firestore and emails it through
[Resend](https://resend.com). Either one succeeding counts as a success, so an
enquiry is not lost when the other is down or unconfigured. It fails only when
both do.

### Email

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | API key from Resend |
| `CONTACT_TO_EMAIL` | inbox that receives enquiries (private; never rendered on the site) |
| `CONTACT_FROM_EMAIL` | optional sender, e.g. `Novix Website <hello@novixsolutions.com>` once the domain is verified in Resend |

Until the domain is verified in Resend, the default sender (`onboarding@resend.dev`) only delivers to the email address the Resend account was created with.

### Firestore

Enquiries land in the `enquiries` collection, one document per submission:
`name`, `email`, `message`, `source` and a server `createdAt`. No IP address
and no user agent — the privacy policy promises the IP is held in memory only,
and storing it would make that false.

| Variable | Value |
| --- | --- |
| `FIREBASE_PROJECT_ID` | from the service account JSON |
| `FIREBASE_CLIENT_EMAIL` | from the service account JSON |
| `FIREBASE_PRIVATE_KEY` | from the service account JSON, quoted; `\n` for the newlines |

Setting it up, once:

1. Create a project at https://console.firebase.google.com.
2. Build → Firestore Database → Create database, in production mode.
3. Leave the security rules denying everything. The server writes with the
   Admin SDK, which bypasses rules; no browser ever talks to Firestore, so any
   rule that allows client access is a hole with nothing behind it.
4. Project settings → Service accounts → Generate new private key. The three
   variables above are all in the downloaded JSON. Do not commit that file.

Leave the variables blank and the form emails only, exactly as it did before.

## Deploy

1. Import the repo at https://vercel.com/new (framework is detected automatically).
2. Add the environment variables above under Project → Settings → Environment Variables.
3. Project → Settings → Domains → add `novixsolutions.com` and `www.novixsolutions.com`, then set the DNS records Vercel shows at your registrar.

## Motion and accessibility

- The HTML renders in its finished state; animations only animate *from* something, so a failed script never hides content.
- `prefers-reduced-motion` gets a fully static page (no loader, no pinning, no cursor).
- The services section pins and scrolls horizontally from 900px up; below that the panels stack.
- Old URLs (`/services`, `/work`, `/about`, `/contact`) redirect to the matching section — see `next.config.ts`.

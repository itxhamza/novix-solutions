# Novix Solutions

Marketing website for Novix Solutions — a static, dependency-free site deployed to
GitHub Pages via GitHub Actions.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page — hero, services, stats, process, work, testimonials, FAQ, CTA |
| `services.html` | Service detail, engagement models, pricing, technology stack |
| `work.html` | Portfolio, featured case study, industries |
| `about.html` | Story, principles, milestones, team |
| `contact.html` | Enquiry form, contact details, next steps |
| `404.html` | Not-found page |

## Structure

```
assets/
  css/styles.css        design tokens + all component styles
  js/main.js            theme toggle, nav drawer, scroll reveal, counters, form validation
  img/novix-lockup.svg  primary logo (mark + wordmark), exported from Figma
  img/novix-mark.svg    logo mark on its own
  img/favicon.svg       mark on a dark rounded tile
robots.txt, sitemap.xml
```

There is no build step. Edit the HTML directly and commit.

## Brand

Colours come from the Figma logo file and are defined once at the top of
`assets/css/styles.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--brand` | `#0ebf43` | Primary green |
| `--brand-2` | `#22d95c` | Bright tint, gradient start |
| `--brand-3` | `#f66135` | Orange accent (from "Solutions") |
| `--amber` | `#f8bf39` | Highlight, star ratings |

Dark is the default theme; light is opt-in via the header toggle and remembered in
`localStorage`. To change the palette, edit the tokens in `:root` and
`:root[data-theme="light"]` — nothing else hardcodes a brand colour.

## Behaviour notes

- Every page works without JavaScript. Scroll-reveal styles are gated behind a `js`
  class so content is never left invisible if the script fails to load.
- `prefers-reduced-motion` disables animation and reveals everything immediately.
- The contact form has no backend (GitHub Pages serves static files only). It
  validates in the browser, then opens the visitor's mail client with the enquiry
  pre-filled. To collect submissions server-side instead, point the `<form>` at a
  form service and remove the `mailto` branch in `assets/js/main.js`.

## Placeholders to replace

- `hello@novixsolutions.com` — used in the footer, contact page and form handler.
- Portfolio entries, client names, testimonials and team members are illustrative.
- Pricing in `services.html` is indicative.

## Deployment

`.github/workflows/static.yml` publishes the repository root to GitHub Pages on every
push to `main`, and can also be run manually from the Actions tab.

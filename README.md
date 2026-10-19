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
  img/illustrations/    custom project artwork + the process pipeline
robots.txt, sitemap.xml
```

There is no build step. Edit the HTML directly and commit.

### URLs

GitHub Pages serves `foo.html` at `/foo`, so the site links to extensionless
paths — `/services`, not `/services.html`. Keep it that way when adding links:
the files stay named `*.html` on disk, but nothing in the markup should reference
the extension. Canonical tags and the sitemap use the clean paths too. Note that
a trailing slash (`/services/`) is **not** served and returns 404.

Asset paths are root-relative (`/assets/...`) so they resolve the same from any
URL depth.

## Brand

Colours come from the Figma logo file and are defined once at the top of
`assets/css/styles.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--brand` | `#0ebf43` | Primary green |
| `--brand-2` | `#22d95c` | Bright tint, gradient start |
| `--brand-3` | `#f66135` | Orange accent (from "Solutions") |
| `--amber` | `#f8bf39` | Highlight, star ratings |

Light is the default theme; dark is opt-in via the header toggle and remembered in
`localStorage`. To change the palette, edit the tokens in `:root` (dark) and
`:root[data-theme="light"]` — nothing else hardcodes a brand colour.

Green is deliberately used as an accent only — eyebrows, icons, links, buttons and
status marks. Headlines and statistics stay in neutral ink; letting the accent carry
large type is what made the first pass read as neon rather than professional.

## Behaviour notes

- Animation runs on **GSAP 3.12.5 + ScrollTrigger** (CDN). Each section has its own
  timeline rather than one generic fade: the hero entrance, a looping marquee,
  card grids that stagger then pop their icons, the stat band, a process pipeline
  that draws itself before the steps land, work cards whose illustrations assemble
  piece by piece, the FAQ, the CTA and the footer. Plus count-up statistics, growing
  chart bars, a scrubbed scroll-progress bar, hero parallax and a pointer tilt.
- **Type animation**: headings marked `data-split` are split into words at runtime
  and rise out of a clipping mask. The splitter only replaces text nodes, so nested
  markup (`<br>`, the gradient span) and the readable text survive.
  Note the heading is hidden with `opacity`, never a CSS `transform` — GSAP treats an
  existing transform as its base offset, which leaves tweened words stranded.
- **Illustrations** are inlined rather than linked as `<img>`, so the artwork reads
  the theme's CSS variables and GSAP can animate the individual shapes. The same
  source also writes standalone files to `assets/img/illustrations/`, which carry
  literal colours since CSS variables do not resolve for an externally referenced SVG.
- There are three motion paths, and all three leave content visible:
  1. GSAP present — GSAP drives everything.
  2. GSAP blocked or failed — falls back to IntersectionObserver reveals and a
     `requestAnimationFrame` counter.
  3. No JavaScript at all — reveal styles are gated behind a `js` class, so nothing
     is ever left at `opacity: 0`.
- `prefers-reduced-motion` skips animation entirely and shows everything at once.
- The contact form has no backend (GitHub Pages serves static files only). It
  validates in the browser, then opens the visitor's mail client with the enquiry
  pre-filled. To collect submissions server-side instead, point the `<form>` at a
  form service and remove the `mailto` branch in `assets/js/main.js`.

## Placeholders to replace

- `hello@novixsolutions.com` — used in the footer, contact page and form handler.
- Portfolio entries, client names, testimonials and team members are illustrative.
- Pricing in `services.html` is indicative.

## Deployment

The site is served at **https://novixsolutions.com** (custom domain, pinned by the
`CNAME` file). `.github/workflows/static.yml` publishes the repository root on every
push to `main`, and can also be run manually from the Actions tab.

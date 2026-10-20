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
- **Section backgrounds** are original vector motifs — tech (circuit traces, blueprint
  grid, isometric layers, radar, contours, signal waves) and AI (neural network,
  latent-space clusters, attention weights, token stream, node constellation). Each
  carries a `viewBox` so it scales to cover and stays centred; percentages are not
  valid in an SVG `transform`, so all placement is in user units. They sit at low
  opacity behind content, which keeps text contrast untouched.
- **Animations must not depend on firing to be correct.** Several entrance effects were
  stranded because a ScrollTrigger start resolved above the top of the page, or a
  refresh reverted a `once` trigger mid-flight. The rule now: apply the rest state
  first and withhold the start value (`immediateRender: false`), so anything that
  never runs still reads correctly. Counters use IntersectionObserver for the same
  reason. A CSS `animation` also outranks inline styles, so the pre-GSAP keyframes
  are disabled under `.gsap`.
- **Scroll-driven 3D** (`assets/js/globe-3d.js`): a node globe that converges out of
  a scattered shell as its section is scrolled through, then turns under its own
  momentum. Raw WebGL again — a perspective camera, two buffers and a shader that
  interpolates each node between its scattered and spherical position. GSAP only
  feeds it scroll progress; the module owns the rendering, and the section reads as
  a normal split layout if WebGL is unavailable.
- **Pins change the position of everything below them**, so the pinned process and
  work rail carry `refreshPriority: 1`. Without it, triggers further down the page
  keep start/end values computed before the pin spacers existed — the globe's
  assembly was firing ~1040px early and was always finished before it came on screen.
- **WebGL backdrop** (`assets/js/shader-bg.js`): a domain-warped noise field in the
  brand greens, drifting slowly, brightening around the pointer and shifting with
  scroll. Raw WebGL — one fullscreen triangle and a fragment shader — because a 3D
  library would outweigh the entire site. Amplitudes are deliberately low: it is
  atmosphere behind text, measured at 6.6:1 (light) and 8.4:1 (dark) for body copy.
  It only ever enhances: the CSS ambient gradient stays underneath and returns if
  WebGL is missing, the context is lost, or the frame budget is missed (a guard
  samples the first 90 frames and tears the canvas down if it cannot hold ~30fps).
  Renders below device resolution, pauses when the tab is hidden, and re-reads the
  theme colours on switch.
- **Load sequence & page transitions**: first visit in a session runs a counter
  and curtain reveal; later navigations get a fast curtain lift, so moving around
  never feels gated. Links are only intercepted for plain same-origin clicks and
  navigate regardless of whether the animation finishes. A preloader that cannot be
  dismissed hides the entire site, so there are four exits: `window.load`, a 3.2s
  hard stop, a 5s hero failsafe, and a CSS keyframe that clears the overlay even if
  `main.js` never runs at all.
- **Live neural field**: a canvas in the hero whose nodes drift, link to neighbours
  and energise around the pointer. It replaces the static SVG constellation only
  once it is actually running, pauses off-screen and when the tab is hidden, and
  re-reads the brand colour when the theme changes.
- **Horizontal work rail**: the Work page pins and scrolls its cards sideways. It
  engages only above 1040px and only with enough cards to make the travel worth a
  pin; the markup is a plain grid, so everywhere else it is a normal section.
- **Pinned process**: phases lift and their numbers scale as you scroll through.
  Progress is never shown by dimming — text stays fully legible at any scroll
  position, including if the pin never engages.
- **Decode labels**: section eyebrows resolve out of noise, and always settle on the
  real text via `onComplete`.
- **Custom cursor**: a dashed reticle that scans, a precise core, and five trailing
  sparks, plus magnetic pull on the primary actions. It reads the luminance of the
  nearest painted background and inverts to white over dark fills. Guarded hard —
  it is built only for a fine pointer with motion allowed and GSAP present, and the
  native cursor is hidden only via a `has-cursor` class set from script, so touch,
  reduced motion, a blocked CDN and JS-off all keep the real cursor. Form controls
  always keep the native caret.
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

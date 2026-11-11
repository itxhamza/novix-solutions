/**
 * ============================================================================
 *  ALL SITE ANIMATION LIVES IN THIS FILE.
 * ============================================================================
 *  Tune timings in TIMING below — nothing else needs to change.
 *
 *   0. TIMING            every duration, delay, distance and ease
 *   1. Helpers
 *   2. Loader            wordmark dissolves into the hero
 *   3. Hero repair       glitched headline snaps into clean type
 *   4. Dot field         canvas grid that bends toward the pointer + pulse
 *   5. Cursor            ring → "Let's talk" pill
 *   6. Services          horizontal pinned scroll + three looping demos
 *   7. Process           light beam, count-up numbers, self-drawing icons
 *   8. Work              diagonal wipe + 3D tilt
 *   9. Reveals           generic fade-up for headings and blocks
 *  10. Send button       button → progress bar → check mark   (exported)
 *  11. initAnimations    entry point, called once by components/Motion.tsx
 *
 *  Rules this file follows:
 *   - The HTML is rendered in its FINISHED state. Animations only ever
 *     animate *from* something, so if a script fails nothing stays hidden.
 *   - prefers-reduced-motion: nothing moves; everything is shown as finished.
 *   - Loops pause when off screen; the canvas sleeps when nothing is moving.
 * ============================================================================
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* -------------------------------------------------------------------------- */
/* 0. TIMING                                                                  */
/* -------------------------------------------------------------------------- */

export const TIMING = {
  loader: {
    minVisible: 1.25, // s — keep slightly longer than --loader-draw in globals.css
    dissolve: 0.5,
  },
  hero: {
    hold: 0.25, // how long the broken state flickers before the repair starts
    repair: 1.15, // letters travelling home
    stagger: 0.014, // per-letter offset (random order)
    snap: 0.2, // the final "click" into place
    scatter: { x: 46, y: 70, rotate: 28, skew: 32 }, // how broken it starts
    fadeIn: 0.7, // eyebrow, subline, buttons
    glyphs: "#/\\_<>[]{}01", // characters swapped in while broken
  },
  field: {
    gapDesktop: 44, // px between dots
    gapMobile: 34,
    radius: 190, // pointer influence, px
    pull: 0.9, // how hard dots lean toward the pointer
    spring: 0.075, // how fast they return (higher = snappier)
    damping: 0.82, // 0–1, lower = less wobble
    restAlpha: 0.2,
    scrolledOpacity: 0.5, // canvas opacity once you leave the hero
    pulseSpeed: 900, // px / s
    pulseForce: 26,
    pulseLife: 1.6, // s
  },
  cursor: {
    follow: 0.22,
    morph: 0.3,
    size: { dot: 14, link: 46, pillW: 104, pillH: 38 },
  },
  services: {
    minWidth: 900, // px — below this the panels stack instead of pinning
    scrub: 0.6,
    panelSlide: 90, // px each panel's copy travels as it enters
    build: { assemble: 0.9, stagger: 0.07, hold: 1.6, scatter: 0.5 },
    rescue: { perRow: 0.55, hold: 1.5, breakAgain: 0.35 },
    team: { draw: 1.1, packet: 0.9, hold: 1.2, fade: 0.5 },
  },
  process: {
    beamScrub: 0.5,
    litAt: "top 62%", // viewport position where the beam "reaches" a step
    count: 0.6,
    draw: 0.9,
    drawStagger: 0.12,
  },
  work: {
    wipe: 1.1,
    wipeStagger: 0.14,
    tiltMax: 9, // degrees
    tiltEase: 0.5,
  },
  reveal: { duration: 0.9, y: 36, start: "top 86%" },
  send: { collapse: 0.4, progress: 2.6, finish: 0.3, morph: 0.45, check: 0.4 },
} as const;

const EASE = {
  repair: "expo.inOut",
  snap: "back.out(3)",
  out: "expo.out",
  inOut: "power3.inOut",
} as const;

/* -------------------------------------------------------------------------- */
/* 1. Helpers                                                                 */
/* -------------------------------------------------------------------------- */

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Play a looping timeline only while its element is on screen. */
function playWhenVisible(el: Element, tl: gsap.core.Timeline) {
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? tl.play() : tl.pause()),
    { threshold: 0.2 },
  );
  io.observe(el);
  return () => io.disconnect();
}

/* -------------------------------------------------------------------------- */
/* 2. Loader                                                                  */
/* -------------------------------------------------------------------------- */

/** Resolves when the loader has started dissolving (or immediately if absent). */
function runLoader(): Promise<void> {
  const loader = $("[data-loader]");
  if (!loader || getComputedStyle(loader).visibility === "hidden") return Promise.resolve();

  loader.style.animation = "none"; // JS is in charge now; drop the CSS failsafe
  const wait = Math.max(0, TIMING.loader.minVisible - performance.now() / 1000);
  const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);

  return new Promise((resolve) => {
    Promise.all([fonts, new Promise((r) => setTimeout(r, wait * 1000))]).then(() => {
      gsap
        .timeline({ onComplete: () => loader.remove() })
        .to("[data-loader-path]", {
          scale: 1.12,
          opacity: 0,
          transformOrigin: "50% 50%",
          duration: TIMING.loader.dissolve,
          ease: "power2.in",
        })
        .to(loader, { opacity: 0, duration: TIMING.loader.dissolve, ease: "power2.out" }, "<0.1")
        .call(() => resolve(), [], "<");
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Hero repair                                                             */
/* -------------------------------------------------------------------------- */

function prepareHero() {
  const T = TIMING.hero;
  const headline = $("[data-hero-headline]");
  if (!headline) return null;

  // Split each word into letters (words stay unbreakable, so wrapping is unchanged).
  const words = $$("[data-word]", headline);
  const originals = words.map((w) => w.textContent ?? "");
  const chars: HTMLElement[] = [];
  words.forEach((word, i) => {
    word.textContent = "";
    for (const letter of originals[i]) {
      const span = document.createElement("span");
      span.className = "hero-char";
      span.textContent = letter;
      span.dataset.char = letter;
      word.appendChild(span);
      chars.push(span);
    }
  });

  const lines = $$("[data-grid-line]");
  const fades = $$("[data-hero-fade]");
  const scan = $("[data-hero-scan]");
  const flash = $("[data-hero-flash]");
  const status = $("[data-hero-status]");
  const fixedText = status?.textContent ?? "";
  const rand = gsap.utils.random;
  const fault = cssVar("--color-fault");
  const accent = cssVar("--color-accent");

  // --- the broken state ---------------------------------------------------
  gsap.set(chars, {
    x: () => rand(-T.scatter.x, T.scatter.x),
    y: () => rand(-T.scatter.y, T.scatter.y),
    rotation: () => rand(-T.scatter.rotate, T.scatter.rotate),
    skewX: () => rand(-T.scatter.skew, T.scatter.skew),
    scale: () => rand(0.7, 1.25),
    opacity: () => rand(0.25, 0.9),
  });
  chars.forEach((c) => {
    if (Math.random() < 0.3) c.textContent = T.glyphs[Math.floor(Math.random() * T.glyphs.length)];
  });
  gsap.set(headline, { textShadow: `-3px 0 ${fault}, 3px 0 ${accent}` });
  gsap.set(lines, {
    x: (_, el) => (el.dataset.axis === "v" ? rand(-60, 60) : rand(-25, 25)),
    y: (_, el) => (el.dataset.axis === "h" ? rand(-50, 50) : rand(-25, 25)),
    rotation: () => rand(-4, 4),
    scaleX: (_, el) => (el.dataset.axis === "h" ? rand(0.25, 0.7) : 1),
    scaleY: (_, el) => (el.dataset.axis === "v" ? rand(0.25, 0.7) : 1),
    opacity: 0.4,
  });
  gsap.set(fades, { opacity: 0, y: 18 });
  if (scan) gsap.set(scan, { opacity: 1 });
  if (status) status.textContent = status.dataset.broken ?? fixedText;

  // Flicker while broken (killed when the repair starts).
  const flicker = gsap.to(chars, {
    opacity: () => rand(0.15, 1),
    x: () => `+=${rand(-6, 6)}`,
    duration: 0.07,
    repeat: -1,
    repeatRefresh: true,
    ease: "steps(1)",
    stagger: { each: 0.004, from: "random" },
  });
  const scanFlicker = scan
    ? gsap.to(scan, { opacity: () => rand(0.35, 1), duration: 0.06, repeat: -1, repeatRefresh: true, ease: "steps(1)" })
    : null;

  // --- the repair ---------------------------------------------------------
  const play = () => {
    const tl = gsap.timeline({ delay: T.hold });
    tl.call(() => {
      flicker.kill();
    })
      .to(chars, {
        x: 0,
        y: 0,
        rotation: 0,
        skewX: 0,
        scale: 1,
        opacity: 1,
        duration: T.repair,
        ease: EASE.repair,
        stagger: { each: T.stagger, from: "random" },
      })
      .to(
        lines,
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: T.repair, ease: EASE.repair, stagger: 0.04 },
        "<",
      );

    // When the last letter lands. Measured now, before the glyph swaps below
    // are added, so the snap always lines up with the end of the repair.
    const snapAt = tl.duration() - T.snap * 0.4;

    // Swap glitch glyphs back to real letters part-way home.
    chars.forEach((c) => {
      if (c.textContent !== c.dataset.char) {
        tl.call(() => void (c.textContent = c.dataset.char ?? ""), [], gsap.utils.random(0.2, T.repair * 0.8));
      }
    });

    // The snap: everything lands at once.
    tl.addLabel("snap", snapAt)
      .call(() => {
        scanFlicker?.kill();
        if (status) status.textContent = fixedText;
      }, [], "snap")
      .set(headline, { textShadow: "none" }, "snap")
      .fromTo(headline, { scale: 1.025 }, { scale: 1, duration: T.snap, ease: EASE.snap, transformOrigin: "0% 60%" }, "snap")
      .to(scan, { opacity: 0, duration: T.snap }, "snap")
      .fromTo(
        flash,
        { scaleX: 0, opacity: 1, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: T.snap, ease: "power4.out" },
        "snap",
      )
      .to(flash, { opacity: 0, duration: 0.35 }, ">")
      .to(lines, { opacity: 0.09, duration: 0.6 }, "snap")
      .to(fades, { opacity: 1, y: 0, duration: T.fadeIn, ease: EASE.out, stagger: 0.08 }, "snap")
      .set(chars, { clearProps: "willChange" });
    return tl;
  };

  const restore = () => {
    flicker.kill();
    scanFlicker?.kill();
    words.forEach((w, i) => (w.textContent = originals[i]));
    if (status) status.textContent = fixedText;
  };

  return { play, restore };
}

/* -------------------------------------------------------------------------- */
/* 4. Dot field (canvas)                                                      */
/* -------------------------------------------------------------------------- */

type Field = { pulse: (x?: number, y?: number) => void; destroy: () => void };
let field: Field | null = null;

function createField(canvas: HTMLCanvasElement, animated: boolean): Field | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const F = TIMING.field;
  const text = cssVar("--color-text") || "#f4f6f8";
  const accent = cssVar("--color-accent") || "#3df57a";

  // Per node: x, y, homeX, homeY, vx, vy
  const STRIDE = 6;
  let nodes = new Float32Array(0);
  let cols = 0;
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let heroVisible = true;
  const pointer = { x: -9999, y: -9999, active: false };
  const pulses: { x: number; y: number; born: number }[] = [];
  const touchOnly = !hasFinePointer();

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gap = w < 700 ? F.gapMobile : F.gapDesktop;
    cols = Math.ceil(w / gap) + 1;
    const rows = Math.ceil(h / gap) + 1;
    const offsetX = (w - (cols - 1) * gap) / 2;
    nodes = new Float32Array(cols * rows * STRIDE);
    for (let r = 0, i = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i += STRIDE) {
        const x = offsetX + c * gap;
        const y = r * gap + gap / 2;
        nodes[i] = nodes[i + 2] = x;
        nodes[i + 1] = nodes[i + 3] = y;
      }
    }
    draw();
  }

  function step(now: number) {
    let energy = 0;
    const R2 = F.radius * F.radius;
    for (let i = 0; i < nodes.length; i += STRIDE) {
      let vx = nodes[i + 4];
      let vy = nodes[i + 5];
      const x = nodes[i];
      const y = nodes[i + 1];

      // Magnetic pull toward the pointer.
      if (pointer.active) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / F.radius) * F.pull;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }
      }
      // Shockwave rings (contact form success).
      for (const p of pulses) {
        const age = (now - p.born) / 1000;
        const ring = age * F.pulseSpeed;
        const dx = x - p.x;
        const dy = y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const off = Math.abs(d - ring);
        if (off < 70) {
          const f = (1 - off / 70) * F.pulseForce * (1 - age / F.pulseLife) * 0.12;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }
      }
      // Spring home.
      vx = (vx + (nodes[i + 2] - x) * F.spring) * F.damping;
      vy = (vy + (nodes[i + 3] - y) * F.spring) * F.damping;
      nodes[i] = x + vx;
      nodes[i + 1] = y + vy;
      nodes[i + 4] = vx;
      nodes[i + 5] = vy;
      energy += Math.abs(vx) + Math.abs(vy);
    }
    return energy;
  }

  function draw() {
    ctx!.clearRect(0, 0, w, h);

    // Resting dots: one batched fill.
    ctx!.fillStyle = text;
    ctx!.globalAlpha = F.restAlpha;
    ctx!.beginPath();
    for (let i = 0; i < nodes.length; i += STRIDE) {
      ctx!.rect(nodes[i] - 0.75, nodes[i + 1] - 0.75, 1.5, 1.5);
    }
    ctx!.fill();

    // Displaced dots glow in the accent colour and link to their neighbours.
    ctx!.fillStyle = accent;
    ctx!.strokeStyle = accent;
    ctx!.lineWidth = 1;
    for (let i = 0; i < nodes.length; i += STRIDE) {
      const m = Math.abs(nodes[i] - nodes[i + 2]) + Math.abs(nodes[i + 1] - nodes[i + 3]);
      if (m < 1.2) continue;
      const a = Math.min(m / 22, 1);
      ctx!.globalAlpha = a;
      const s = 1.5 + a * 2.2;
      ctx!.fillRect(nodes[i] - s / 2, nodes[i + 1] - s / 2, s, s);

      ctx!.globalAlpha = a * 0.35;
      ctx!.beginPath();
      const right = i + STRIDE;
      const below = i + cols * STRIDE;
      if ((i / STRIDE + 1) % cols !== 0) {
        ctx!.moveTo(nodes[i], nodes[i + 1]);
        ctx!.lineTo(nodes[right], nodes[right + 1]);
      }
      if (below < nodes.length) {
        ctx!.moveTo(nodes[i], nodes[i + 1]);
        ctx!.lineTo(nodes[below], nodes[below + 1]);
      }
      ctx!.stroke();
    }
    ctx!.globalAlpha = 1;
  }

  function frame(now: number) {
    raf = 0;
    if (document.hidden) return;
    last = now;

    // Phones have no pointer: let a slow invisible one wander over the hero.
    if (touchOnly) {
      pointer.active = heroVisible;
      pointer.x = w * (0.5 + 0.38 * Math.sin(now / 2300));
      pointer.y = h * (0.42 + 0.26 * Math.sin(now / 1700 + 1));
    }
    while (pulses.length && (now - pulses[0].born) / 1000 > F.pulseLife) pulses.shift();

    const energy = step(now);
    draw();
    // Sleep when nothing is moving; any input wakes it again.
    if (pointer.active || pulses.length || energy > 0.4) wake();
  }
  function wake() {
    if (!raf && animated) raf = requestAnimationFrame(frame);
  }

  // --- events -------------------------------------------------------------
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    wake();
  };
  const onLeave = () => {
    pointer.active = false;
  };
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // Ignore the small height changes caused by mobile browser chrome.
      if (window.innerWidth !== w || Math.abs((canvas.clientHeight || 0) - h) > 140) build();
    }, 180);
  };
  const onVisibility = () => !document.hidden && wake();

  build();
  document.documentElement.classList.add("field-live");
  gsap.to(canvas, { opacity: 1, duration: 1.2, ease: "power2.out" });

  let heroObserver: IntersectionObserver | null = null;
  if (animated) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    const hero = $("[data-hero]");
    if (hero) {
      heroObserver = new IntersectionObserver(([e]) => {
        heroVisible = e.isIntersecting;
        if (heroVisible) wake();
      });
      heroObserver.observe(hero);
    }
    wake();
  }
  window.addEventListener("resize", onResize, { passive: true });

  return {
    pulse(x = w / 2, y = h / 2) {
      if (!animated) return;
      pulses.push({ x, y, born: last || performance.now() });
      wake();
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      heroObserver?.disconnect();
      document.documentElement.classList.remove("field-live");
    },
  };
}

/** Sends a shockwave through the dot field. Called on contact-form success. */
export function pulseField() {
  if (!field) return;
  field.pulse();
  // Lift the canvas to full strength for the moment of the pulse.
  const canvas = $("[data-field]");
  if (canvas && !prefersReducedMotion()) {
    const base = Number(gsap.getProperty(canvas, "opacity"));
    gsap.timeline().to(canvas, { opacity: 1, duration: 0.15 }).to(canvas, { opacity: base, duration: 1.4 }, "+=0.5");
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Cursor                                                                  */
/* -------------------------------------------------------------------------- */

function initCursor() {
  const el = $("[data-cursor]");
  const ring = $("[data-cursor-ring]");
  const label = $("[data-cursor-label]");
  if (!el || !ring || !label || !hasFinePointer()) return () => {};

  const C = TIMING.cursor;
  const accent = cssVar("--color-accent");
  document.documentElement.classList.add("has-cursor");
  gsap.set(ring, { xPercent: -50, yPercent: -50 });

  const xTo = gsap.quickTo(el, "x", { duration: C.follow, ease: "power3" });
  const yTo = gsap.quickTo(el, "y", { duration: C.follow, ease: "power3" });
  let state = "";
  let shown = false;

  const setState = (next: "dot" | "link" | "talk" | "hidden") => {
    if (next === state) return;
    state = next;
    const base = { duration: C.morph, ease: EASE.out, overwrite: true } as const;
    if (next === "talk") {
      gsap.to(ring, { ...base, width: C.size.pillW, height: C.size.pillH, y: 34, backgroundColor: accent, opacity: 1 });
      gsap.to(label, { opacity: 1, duration: 0.2, delay: 0.08 });
    } else {
      gsap.to(label, { opacity: 0, duration: 0.1, overwrite: true });
      const size = next === "link" ? C.size.link : C.size.dot;
      gsap.to(ring, {
        ...base,
        width: size,
        height: size,
        y: 0,
        backgroundColor: "rgba(61,245,122,0)",
        opacity: next === "hidden" ? 0 : 1,
      });
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    xTo(e.clientX);
    yTo(e.clientY);
    if (!shown) {
      shown = true;
      gsap.set(el, { x: e.clientX, y: e.clientY });
      gsap.to(el, { opacity: 1, duration: 0.3 });
    }
    const t = e.target as Element | null;
    if (!t?.closest) return;
    if (t.closest("input, textarea, select")) setState("hidden");
    else if (t.closest('[data-cursor="talk"]')) setState("talk");
    else if (t.closest("a, button, [data-tilt]")) setState("link");
    else setState("dot");
  };
  const onOut = () => {
    shown = false;
    gsap.to(el, { opacity: 0, duration: 0.2 });
  };
  const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.12 });
  const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: EASE.snap });

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  document.documentElement.addEventListener("pointerleave", onOut);
  setState("dot");

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    document.documentElement.removeEventListener("pointerleave", onOut);
    document.documentElement.classList.remove("has-cursor");
  };
}

/* -------------------------------------------------------------------------- */
/* 6. Services — pinned horizontal scroll + looping demos                     */
/* -------------------------------------------------------------------------- */

function initServicesScroll(mm: gsap.MatchMedia) {
  const S = TIMING.services;
  mm.add(`(min-width: ${S.minWidth}px)`, () => {
    const pin = $("[data-services-pin]");
    const track = $("[data-services-track]");
    if (!pin || !track) return;

    pin.classList.add("is-horizontal");
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const scroll = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        pin: true,
        start: "top top",
        end: () => `+=${distance()}`,
        scrub: S.scrub,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        refreshPriority: 1, // pins must be measured before the triggers below them
      },
    });

    gsap.to("[data-services-progress]", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${distance()}`, scrub: true },
    });

    // Each panel's copy slides in as the panel enters from the right.
    $$("[data-panel]", track).forEach((panel) => {
      gsap.from($$("[data-panel-copy] > *", panel), {
        x: S.panelSlide,
        opacity: 0,
        stagger: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: scroll,
          start: "left 95%",
          end: "left 45%",
          scrub: true,
        },
      });
    });

    return () => pin.classList.remove("is-horizontal");
  });
}

/** Demo 1 — phone assembles from scattered pieces, ships, falls apart, repeats. */
function buildDemo(svg: Element) {
  const B = TIMING.services.build;
  const pieces = $$<SVGElement>("[data-piece]", svg);
  const badge = $<SVGElement>("[data-build-badge]", svg);
  const cta = $<SVGElement>("[data-build-cta]", svg);
  const rand = gsap.utils.random;
  const scattered = {
    x: () => rand(-150, 150),
    y: () => rand(-170, 170),
    rotation: () => rand(-70, 70),
    scale: () => rand(0.5, 0.9),
    opacity: 0,
  };
  gsap.set(pieces, { transformOrigin: "50% 50%" });

  return gsap
    .timeline({ repeat: -1, repeatRefresh: true, paused: true, defaults: { ease: EASE.out } })
    .set(badge, { scale: 0, transformOrigin: "50% 50%" })
    .fromTo(
      pieces,
      scattered,
      { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: B.assemble, ease: "back.out(1.3)", stagger: B.stagger },
    )
    .fromTo(cta, { fillOpacity: 0.35 }, { fillOpacity: 1, duration: 0.3 }, ">-0.1")
    .to(badge, { scale: 1, duration: 0.45, ease: EASE.snap }, "<")
    .to({}, { duration: B.hold })
    .to(badge, { scale: 0, duration: 0.2, ease: "power2.in" })
    .to(pieces, { ...scattered, duration: B.scatter, ease: "power3.in", stagger: 0.02 }, "<");
}

/** Demo 2 — error rows are scanned and fixed one by one. */
function rescueDemo(svg: Element) {
  const R = TIMING.services.rescue;
  const rows = $$<SVGElement>("[data-rescue-row]", svg);
  const status = $<SVGTextElement>("[data-rescue-status]", svg);
  const frame = $<SVGElement>("[data-rescue-frame]", svg);
  const scan = $<SVGElement>("[data-rescue-scan]", svg);
  if (!status) return gsap.timeline({ paused: true });

  const fault = cssVar("--color-fault");
  const accent = cssVar("--color-accent");
  const textCol = cssVar("--color-text");
  const line = cssVar("--color-line");
  const brokenWord = (status.dataset.broken ?? "errors").toUpperCase();
  const fixedWord = (status.dataset.fixed ?? "All clear").toUpperCase();
  const setCount = (n: number) => {
    status.textContent = n > 0 ? `${n} ${brokenWord}` : fixedWord;
  };
  const part = (row: Element, name: string) => $<SVGElement>(`[data-rescue-${name}]`, row);

  const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: EASE.out } });

  // Break everything (instantly on the first pass, as a glitch on later ones).
  tl.call(() => setCount(rows.length))
    .set(status, { fill: fault })
    .set(frame, { stroke: fault })
    .set(scan, { opacity: 0, y: 0 });
  rows.forEach((row, i) => {
    tl.set(part(row, "bar"), { stroke: fault, x: i % 2 ? 7 : -6, skewX: i % 2 ? -8 : 6, transformOrigin: "50% 50%" }, 0)
      .set(part(row, "dot"), { fill: fault }, 0)
      .set(part(row, "line"), { fill: fault, scaleX: 0.45 + (i % 3) * 0.2, transformOrigin: "0% 50%" }, 0)
      .set(part(row, "ok"), { opacity: 0 }, 0)
      .set(part(row, "bad"), { opacity: 1 }, 0);
  });
  tl.fromTo(rows, { x: -3 }, { x: 3, duration: 0.06, repeat: 5, yoyo: true, ease: "steps(1)" }, 0).set(rows, { x: 0 });

  // Fix them one at a time.
  tl.to(scan, { opacity: 0.9, duration: 0.2 }, "+=0.5");
  rows.forEach((row, i) => {
    const at = `fix${i}`;
    tl.addLabel(at)
      .to(scan, { y: 30 + i * 60, duration: R.perRow * 0.5, ease: EASE.inOut }, at)
      .to(part(row, "bar"), { stroke: line, x: 0, skewX: 0, duration: R.perRow * 0.5, ease: EASE.snap }, ">")
      .to(part(row, "line"), { fill: cssVar("--color-muted"), scaleX: 1, duration: R.perRow * 0.5 }, "<")
      .to(part(row, "dot"), { fill: accent, duration: 0.2 }, "<")
      .fromTo(part(row, "dot"), { scale: 1.5, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.35, ease: EASE.snap }, "<")
      .set(part(row, "bad"), { opacity: 0 }, "<")
      .set(part(row, "ok"), { opacity: 1 }, "<")
      .call(() => setCount(rows.length - 1 - i), [], "<");
  });
  tl.to(scan, { opacity: 0, duration: 0.2 })
    .to(status, { fill: accent, duration: 0.2 }, "<")
    .to(frame, { stroke: accent, duration: 0.25 }, "<")
    .to(frame, { stroke: textCol, duration: 0.8 }, ">0.2")
    .to({}, { duration: R.hold })
    .to(rows, { x: 4, duration: R.breakAgain / 6, repeat: 5, yoyo: true, ease: "steps(1)" })
    .set(rows, { x: 0 });
  return tl;
}

/** Demo 3 — a line draws from the US to Pakistan and messages travel along it. */
function teamDemo(root: Element) {
  const M = TIMING.services.team;
  const arc = $<SVGPathElement>("[data-team-arc]", root);
  const glow = $<SVGPathElement>("[data-team-glow]", root);
  const packet = $<SVGElement>("[data-team-packet]", root);
  const avatars = $$<SVGElement>("[data-team-avatar]", root);
  const rings = $$<SVGElement>("[data-team-ring]", root);
  const labels = $$("[data-team-label]", root);
  if (!arc || !packet) return gsap.timeline({ paused: true });

  const length = arc.getTotalLength();
  const travel = { t: 0 };
  const place = () => {
    const p = arc.getPointAtLength(travel.t * length);
    gsap.set(packet, { attr: { cx: p.x, cy: p.y } });
  };
  gsap.set([...rings, ...avatars], { transformOrigin: "50% 50%" });

  return gsap
    .timeline({ repeat: -1, paused: true, defaults: { ease: EASE.out } })
    .set([arc, glow], { strokeDashoffset: 1, opacity: 1 })
    .set(packet, { opacity: 0 })
    .fromTo(avatars, { scale: 0 }, { scale: 1, duration: 0.5, ease: EASE.snap, stagger: 0.25 })
    .fromTo(labels, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.25 }, "<")
    .to([arc, glow], { strokeDashoffset: 0, duration: M.draw, ease: EASE.inOut }, ">-0.1")
    .fromTo(rings, { scale: 1, opacity: 0.6 }, { scale: 1.9, opacity: 0, duration: 0.9, stagger: 0.15 }, ">-0.2")
    // message there…
    .set(packet, { opacity: 1 })
    .fromTo(travel, { t: 0 }, { t: 1, duration: M.packet, ease: EASE.inOut, onUpdate: place })
    .fromTo(rings[1], { scale: 1, opacity: 0.6 }, { scale: 1.9, opacity: 0, duration: 0.7 })
    // …and back
    .to(travel, { t: 0, duration: M.packet, ease: EASE.inOut, onUpdate: place }, "<0.15")
    .fromTo(rings[0], { scale: 1, opacity: 0.6 }, { scale: 1.9, opacity: 0, duration: 0.7 })
    .set(packet, { opacity: 0 }, "<")
    .to({}, { duration: M.hold })
    .to([arc, glow], { opacity: 0, duration: M.fade })
    .to(avatars, { scale: 0, duration: 0.3, ease: "power2.in" }, "<")
    .to(labels, { opacity: 0, duration: 0.3 }, "<");
}

function initDemos() {
  const builders: Record<string, (el: Element) => gsap.core.Timeline> = {
    build: buildDemo,
    rescue: rescueDemo,
    team: teamDemo,
  };
  const stops = $$("[data-demo]").map((el) => {
    const make = builders[(el as HTMLElement).dataset.demo ?? ""];
    return make ? playWhenVisible(el, make(el)) : () => {};
  });
  return () => stops.forEach((stop) => stop());
}

/* -------------------------------------------------------------------------- */
/* 7. Process — beam, count-up, self-drawing icons                            */
/* -------------------------------------------------------------------------- */

function initProcess() {
  const P = TIMING.process;
  const list = $("[data-beam]");
  if (!list) return;
  const fill = $("[data-beam-fill]", list);
  const head = $("[data-beam-head]", list);
  const track = fill?.parentElement;

  // The beam: one light travelling down the line as you scroll.
  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: list,
        start: P.litAt,
        end: () => `bottom ${P.litAt.split(" ")[1]}`,
        scrub: P.beamScrub,
        onUpdate: (self) => {
          if (head && track) gsap.set(head, { y: self.progress * track.offsetHeight });
        },
      },
    },
  );

  // Each step lights up as the beam reaches it.
  $$("[data-step]", list).forEach((step) => {
    const num = $("[data-step-num]", step);
    const target = Number(num?.dataset.value ?? 0);
    const counter = { v: 0 };
    const paths = $$<SVGPathElement>("[data-draw]", step);

    // Icon strokes draw in (and un-draw if you scroll back above the step).
    const draw = gsap.fromTo(
      paths,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: P.draw, ease: EASE.inOut, stagger: P.drawStagger, paused: true },
    );
    // The number counts up each time the step lights. It is never left at 00.
    const count = () =>
      gsap.fromTo(
        counter,
        { v: 0 },
        {
          v: target,
          duration: P.count,
          ease: "power1.out",
          onUpdate: () => {
            if (num) num.textContent = String(Math.round(counter.v)).padStart(2, "0");
          },
        },
      );

    ScrollTrigger.create({
      trigger: step,
      start: P.litAt,
      onEnter: () => {
        step.classList.add("is-lit");
        draw.play();
        count();
      },
      onLeaveBack: () => {
        step.classList.remove("is-lit");
        draw.reverse();
      },
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 8. Work — diagonal wipe + 3D tilt                                          */
/* -------------------------------------------------------------------------- */

function initWork() {
  const W = TIMING.work;

  // Diagonal wipe as the cards scroll in.
  const cards = $$("[data-wipe]");
  if (cards.length) {
    cards.forEach((c) => c.classList.add("is-wiping"));
    gsap.fromTo(
      cards,
      { "--wipe": 0 },
      {
        "--wipe": 1,
        duration: W.wipe,
        ease: EASE.inOut,
        stagger: W.wipeStagger,
        scrollTrigger: { trigger: cards[0], start: "top 82%", once: true },
        // Drop the clip afterwards so the 3D tilt is free to overflow.
        onComplete: () => cards.forEach((c) => c.classList.remove("is-wiping")),
      },
    );
  }

  return bindTilt();
}

/**
 * True 3D tilt (perspective + rotateX/Y) on every [data-tilt] inside `root`,
 * pointer devices only. Returns a cleanup.
 *
 * Exported because the work grid re-renders its cards when a filter changes
 * and has to re-bind them; initWork() binds the whole document once.
 */
export function bindTilt(root: ParentNode = document): () => void {
  const W = TIMING.work;
  if (!hasFinePointer()) return () => {};
  const offs = $$("[data-tilt]", root).map((card) => {
    const inner = $("[data-tilt-inner]", card);
    if (!inner) return () => {};
    const rx = gsap.quickTo(inner, "rotationX", { duration: W.tiltEase, ease: "power3" });
    const ry = gsap.quickTo(inner, "rotationY", { duration: W.tiltEase, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 2 * W.tiltMax);
      rx(-(py - 0.5) * 2 * W.tiltMax);
      inner.style.setProperty("--gx", `${px * 100}%`);
      inner.style.setProperty("--gy", `${py * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  });
  return () => offs.forEach((off) => off());
}

/* -------------------------------------------------------------------------- */
/* 9. Reveals                                                                 */
/* -------------------------------------------------------------------------- */

function initReveals() {
  const R = TIMING.reveal;
  $$("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: R.y,
      opacity: 0,
      duration: R.duration,
      ease: EASE.out,
      scrollTrigger: { trigger: el, start: R.start, once: true },
    });
  });

  // The field dims once you scroll past the hero so it never fights the text.
  const hero = $("[data-hero]");
  if (hero) {
    gsap.fromTo(
      "[data-field]",
      { opacity: 1 },
      {
        opacity: TIMING.field.scrolledOpacity,
        ease: "none",
        immediateRender: false,
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 10. Send button — button → progress bar → check mark                       */
/* -------------------------------------------------------------------------- */

export function createSendButton(button: HTMLButtonElement) {
  const S = TIMING.send;
  const label = $("[data-send-label]", button);
  const fill = $("[data-send-fill]", button);
  const check = $("[data-send-check]", button);
  const tick = check?.querySelector("path") ?? null;
  const instant = prefersReducedMotion();
  const track = "rgba(244,246,248,0.16)";
  let progress: gsap.core.Tween | null = null;

  return {
    /** Collapse into a thin bar and start filling while the request is in flight. */
    start() {
      if (instant) return;
      gsap.killTweensOf([button, label, fill, check, tick]);
      gsap
        .timeline()
        .to(label, { opacity: 0, duration: 0.15 })
        .to(button, { height: 6, backgroundColor: track, duration: S.collapse, ease: EASE.inOut }, "<")
        .set(fill, { opacity: 1 }, "<");
      progress = gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 0.86, duration: S.progress, ease: "power2.out" });
    },

    /** Fill to 100%, then morph the bar into a check mark. */
    success(): Promise<void> {
      if (instant) {
        gsap.set(label, { opacity: 0 });
        gsap.set(check, { opacity: 1 });
        gsap.set(tick, { strokeDashoffset: 0 });
        return Promise.resolve();
      }
      progress?.kill();
      return new Promise((resolve) => {
        gsap
          .timeline({ onComplete: resolve })
          .to(fill, { scaleX: 1, duration: S.finish, ease: "power2.out" })
          .to(button, { width: 56, height: 56, backgroundColor: cssVar("--color-accent"), duration: S.morph, ease: EASE.snap })
          .set(fill, { opacity: 0 }, "<")
          .set(check, { opacity: 1 })
          .fromTo(tick, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: S.check, ease: "power2.out" });
      });
    },

    /** Back to a normal button (after an error, or a while after success). */
    reset() {
      progress?.kill();
      gsap.killTweensOf([button, label, fill, check, tick]);
      gsap.set([button, label, fill, check, tick], { clearProps: "all" });
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 11. Entry point                                                            */
/* -------------------------------------------------------------------------- */

export function initAnimations(): () => void {
  gsap.registerPlugin(ScrollTrigger);
  const cleanups: Array<() => void> = [];
  const canvas = $<HTMLCanvasElement>("[data-field]");

  // Reduced motion: draw the dot field once, and leave everything else as the
  // finished, static page it already is.
  if (prefersReducedMotion()) {
    $("[data-loader]")?.remove();
    if (canvas) field = createField(canvas, false);
    return () => {
      field?.destroy();
      field = null;
    };
  }

  document.documentElement.classList.add("anim");
  const hero = prepareHero();
  if (canvas) field = createField(canvas, true);
  cleanups.push(initCursor());

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    initServicesScroll(mm);
    initProcess();
    initReveals();
    cleanups.push(initWork());
  });
  cleanups.push(initDemos());

  runLoader().then(() => hero?.play());

  // Layout shifts when webfonts land; re-measure the scroll positions.
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  return () => {
    cleanups.forEach((fn) => fn());
    mm.revert();
    ctx.revert();
    hero?.restore();
    field?.destroy();
    field = null;
    document.documentElement.classList.remove("anim");
  };
}

"use client";

import { useEffect } from "react";

/**
 * Loads the animation module after first paint so GSAP never blocks rendering.
 * Every animation on the site is defined in lib/animations.ts.
 */
export function Motion() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/animations").then((m) => {
      if (!cancelled) cleanup = m.initAnimations();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
  return null;
}

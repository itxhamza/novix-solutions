"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Where a page starts.
 *
 * lib/animations.ts refreshes ScrollTrigger as a page mounts, and again once
 * the webfonts land. A refresh restores the scroll position it measured, so
 * without this a link in the footer could open the next page halfway down it.
 *
 * No hash means the top of the page, a hash means that section, and either is
 * re-applied once the layout has settled — unless the reader has started
 * scrolling, whose intent beats ours.
 */
export function scrollToSection(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  // scroll-margin-top in globals.css keeps the target clear of the header.
  if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
}

export function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    let moved = false;
    const stand = () => {
      moved = true;
    };
    const passive = { passive: true, once: true } as const;
    window.addEventListener("wheel", stand, passive);
    window.addEventListener("touchmove", stand, passive);
    window.addEventListener("keydown", stand, { once: true });

    const place = () => {
      if (moved) return;
      const { hash } = window.location;
      if (hash) scrollToSection(hash);
      // `instant` overrides the smooth scroll-behavior in globals.css, which
      // would otherwise animate the whole page up on every navigation.
      else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    place();
    const frame = requestAnimationFrame(place);
    const settled = setTimeout(place, 400);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settled);
      window.removeEventListener("wheel", stand);
      window.removeEventListener("touchmove", stand);
      window.removeEventListener("keydown", stand);
    };
  }, [pathname]);

  return null;
}

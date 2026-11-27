"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating return-to-top control, bottom right.
 *
 * It is an anchor to #top rather than a scripted scroll: with no element of
 * that id the HTML spec sends the browser to the top of the document, so the
 * travel itself is the browser's, and `scroll-behavior` decides whether it
 * glides or jumps — which the reduced-motion block already answers. The only
 * thing JavaScript does here is decide when it is worth showing.
 *
 * It stays out of the tab order and out of the accessibility tree while
 * hidden, so it is never a focus stop floating over the page.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);
  const isShown = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      // One screen down is far enough that the top is no longer in reach.
      const next = window.scrollY > window.innerHeight;
      if (next === isShown.current) return;
      isShown.current = next;
      setShown(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#top"
      className={`back-to-top${shown ? " is-shown" : ""}`}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </a>
  );
}

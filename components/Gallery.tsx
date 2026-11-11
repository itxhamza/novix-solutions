"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { DeviceFrame, type Shot } from "./DeviceFrame";

/**
 * Screenshot gallery with a lightbox.
 *
 * Keyboard: Enter/Space opens a shot, Escape closes, ← → move between shots.
 * Focus moves into the dialog on open and returns to the trigger on close.
 *
 * The lightbox is portalled to <body>: it is position:fixed, and the reveal
 * animation puts a transform on the section above it, which would otherwise
 * become the containing block and strand the dialog mid-page.
 */
export function Gallery({ shots }: { shots: Shot[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen((i) => {
      if (i !== null) triggers.current[i]?.focus();
      return null;
    });
  }, []);

  const step = useCallback(
    (delta: number) =>
      setOpen((i) =>
        i === null ? i : (i + delta + shots.length) % shots.length,
      ),
    [shots.length],
  );

  useEffect(() => {
    if (open === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    // Stop the page behind the lightbox from scrolling.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close, step]);

  const current = open === null ? undefined : shots[open];

  return (
    <>
      <ul className="gallery">
        {shots.map((shot, i) => (
          <li
            key={shot.src}
            className={shot.frame === "phone" ? "gallery-phone" : "gallery-web"}
          >
            <button
              type="button"
              ref={(el) => {
                triggers.current[i] = el;
              }}
              onClick={() => setOpen(i)}
              className="gallery-trigger"
              aria-label={`Open screenshot: ${shot.alt}`}
            >
              <DeviceFrame shot={shot} />
            </button>
          </li>
        ))}
      </ul>

      {current && mounted
        ? createPortal(
            <div
              className="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={current.alt}
              onClick={close}
            >
              <button
                ref={closeRef}
                type="button"
                className="lightbox-close"
                onClick={close}
                aria-label="Close"
              >
                <span aria-hidden="true">✕</span>
              </button>

              {shots.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="lightbox-nav lightbox-prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(-1);
                    }}
                    aria-label="Previous screenshot"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    type="button"
                    className="lightbox-nav lightbox-next"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(1);
                    }}
                    aria-label="Next screenshot"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </>
              ) : null}

              {/* Click inside the image must not close the dialog. */}
              <figure
                className="lightbox-figure"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="90vw"
                  className="lightbox-img"
                />
                <figcaption className="lightbox-caption">
                  {current.alt}
                  {shots.length > 1 ? (
                    <span className="mono ml-3 text-muted">
                      {(open ?? 0) + 1} / {shots.length}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

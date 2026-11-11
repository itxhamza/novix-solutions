"use client";

import { useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/lib/content/schema";

/**
 * Card carousel. Only approved entries ever reach this component, and the
 * section is not rendered at all when there are none.
 *
 * With a single entry the controls are hidden, so it reads as a plain quote.
 * Movement is a CSS transition, which prefers-reduced-motion already disables
 * site-wide, leaving an instant swap.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const many = items.length > 1;
  const current = items[index];
  if (!current) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section className="relative py-28 md:py-36" aria-labelledby="testimonials-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div>
            <p className="eyebrow mb-6">Testimonials</p>
            <h2 id="testimonials-title" className="display h-section">
              In their words.
            </h2>
          </div>

          {many ? (
            <div className="flex gap-3">
              <button type="button" className="carousel-btn" onClick={() => go(-1)} aria-label="Previous testimonial">
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" className="carousel-btn" onClick={() => go(1)} aria-label="Next testimonial">
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : null}
        </div>

        <figure className="testimonial-card mt-14" data-reveal>
          <blockquote className="display text-xl !leading-[1.3] md:text-3xl">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          <figcaption className="mt-10 flex items-center gap-4">
            {current.photo ? (
              <Image
                src={current.photo}
                alt={current.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : null}
            <span>
              <span className="block font-semibold">{current.name}</span>
              <span className="block text-sm text-muted">
                {current.role}
                {/* Company is appended only when it has been supplied. */}
                {current.company ? `, ${current.company}` : ""}
              </span>
            </span>
          </figcaption>

          {many ? (
            <p className="mono mt-8 text-muted" aria-live="polite">
              {index + 1} / {items.length}
            </p>
          ) : null}
        </figure>
      </div>
    </section>
  );
}

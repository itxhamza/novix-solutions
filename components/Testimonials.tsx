"use client";

import { useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/lib/content/schema";

/**
 * The quote as a full-width statement rather than a card.
 *
 * Words are wrapped individually so lib/animations.ts can bring them up as you
 * scroll; they start fully legible in CSS, so with JS off or motion reduced the
 * quote is simply there. Only approved entries reach this component, and the
 * section is not rendered at all when there are none.
 *
 * The photo renders only when one exists in content — there is no silhouette
 * standing in for a person we have no picture of.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const many = items.length > 1;
  const current = items[index];
  if (!current) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section className="testimonial-band band-panel" aria-labelledby="testimonials-title">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center" data-reveal>
          <p className="eyebrow mb-6 justify-center">Testimonials</p>
          <h2 id="testimonials-title" data-glitch className="display h-chapter">
            In their words.
          </h2>

          {many ? (
            <div className="mt-10 flex justify-center gap-3">
              <button
                type="button"
                className="carousel-btn"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                className="carousel-btn"
                onClick={() => go(1)}
                aria-label="Next testimonial"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : null}
        </div>

        <figure className="testimonial-statement">
          <blockquote
            className="testimonial-quote display"
            data-quote
            /* The animated copy is per-word; this keeps it one sentence to a
               screen reader rather than a list of fragments. */
            aria-label={`“${current.quote}”`}
          >
            <span aria-hidden="true">
              &ldquo;
              {current.quote.split(" ").map((word, i) => (
                <span key={`${word}-${i}`}>
                  <span className="quote-word" data-quote-word>
                    {word}
                  </span>{" "}
                </span>
              ))}
              &rdquo;
            </span>
          </blockquote>

          <figcaption className="testimonial-by" data-reveal>
            {current.photo ? (
              <Image
                src={current.photo}
                alt={current.name}
                width={72}
                height={72}
                className="testimonial-photo"
              />
            ) : null}
            <span>
              <span className="block text-lg font-semibold">{current.name}</span>
              <span className="mono block text-muted">
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

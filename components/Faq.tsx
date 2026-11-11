"use client";

import { useState } from "react";
import { faqs, faqSection } from "@/content/faq";

/**
 * Accordion, one open at a time.
 *
 * Height is animated with a CSS grid-rows transition rather than JS, so it
 * stays smooth and is disabled automatically under prefers-reduced-motion.
 * Every answer is in the HTML regardless of open state, so it is always
 * readable to search engines and assistive tech.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-28 md:py-36" aria-labelledby="faq-title">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div data-reveal>
          <p className="eyebrow mb-6">{faqSection.eyebrow}</p>
          <h2 id="faq-title" className="display h-section">
            {faqSection.title}
          </h2>
          <p className="lede mt-6">{faqSection.intro}</p>
        </div>

        <ul className="faq" data-reveal>
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.question} className={`faq-item${isOpen ? " is-open" : ""}`}>
                <h3>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{item.question}</span>
                    <span className="faq-sign" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-panel-${i}`} className="faq-panel" role="region" aria-label={item.question}>
                  <div className="faq-panel-inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

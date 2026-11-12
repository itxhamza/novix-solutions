import { site } from "@/content/site";

/**
 * Full-width closing band.
 *
 * The particle field from the hero is reused here at low intensity: the same
 * canvas renderer in lib/animations.ts picks up any [data-field] element, and
 * `data-field-intensity` dials it down so it never competes with the text.
 */
export function FinalCta() {
  const { contactSection: c, contact } = site;

  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <canvas className="field field-inline" data-field data-field-intensity="0.35" aria-hidden="true" />

      <div className="shell relative z-10 flex flex-col items-center gap-8 py-28 text-center md:py-36">
        <h2 id="final-cta-title" className="display h-section max-w-4xl" data-reveal>
          {c.title}
        </h2>
        <p className="lede" data-reveal>
          {c.intro}
        </p>
        <div className="flex flex-wrap justify-center gap-3" data-reveal>
          <a
            href={contact.bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            data-cursor="talk"
          >
            {c.scheduleCta}
          </a>
          <a href={contact.emailHref} className="btn btn-ghost" data-cursor="talk">
            {site.hero.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

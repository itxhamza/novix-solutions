import { site } from "@/content/site";

/**
 * The one green band on the page, and the last thing on it.
 *
 * The particle field that used to sit behind this was dropped with the accent
 * treatment: pale dots on green read as dirt, and the band is already the
 * loudest thing here without them.
 */
export function FinalCta() {
  const { contactSection: c, contact } = site;

  return (
    <section className="final-cta band-accent" aria-labelledby="final-cta-title">

      <div className="shell relative z-10 flex flex-col items-center gap-8 py-28 text-center md:py-36">
        <h2 id="final-cta-title" data-glitch className="display h-section max-w-4xl" data-reveal>
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

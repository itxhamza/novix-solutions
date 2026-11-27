import { site } from "@/content/site";
import { featuredTestimonial } from "@/content/testimonials";
import { HeroStack } from "./HeroStack";

// Positions (in %) of the frame lines that start out "broken" and snap into place.
const GRID_LINES = [
  { axis: "h", at: 18 },
  { axis: "h", at: 82 },
  { axis: "v", at: 6 },
  { axis: "v", at: 38 },
  { axis: "v", at: 71 },
  { axis: "v", at: 94 },
] as const;

export function Hero() {
  const { hero, contact } = site;
  const accent = new Set<string>(hero.headlineAccent.map((w) => w.toLowerCase()));
  const words = hero.headline.split(" ");

  return (
    <section
      id="top"
      data-hero
      className="relative flex min-h-svh flex-col justify-end overflow-hidden pt-28 pb-10 md:pb-14"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {GRID_LINES.map((l) => (
          <span
            key={`${l.axis}${l.at}`}
            className="grid-line"
            data-grid-line
            data-axis={l.axis}
            style={l.axis === "h" ? { top: `${l.at}%` } : { left: `${l.at}%` }}
          />
        ))}
      </div>

      <div className="shell relative">
        {/* Copy left, the products themselves right. */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-6 md:mb-8" data-hero-fade>
              {hero.eyebrow}
            </p>

            <div className="relative">
              <h1 className="display h-hero max-w-[15ch] lg:max-w-none" data-hero-headline aria-label={hero.headline}>
                {words.map((word, i) => {
                  const isAccent = accent.has(word.replace(/[^\p{L}]/gu, "").toLowerCase());
                  return (
                    <span key={i} aria-hidden="true">
                      <span className={`hero-word${isAccent ? " hero-accent" : ""}`} data-word>
                        {word}
                      </span>
                      {i < words.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </h1>
              <span className="hero-scan" data-hero-scan aria-hidden="true" />
              <span className="hero-flash" data-hero-flash aria-hidden="true" />
            </div>

            <p className="lede mt-7 max-w-xl" data-hero-fade>
              {hero.subline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3" data-hero-fade>
              <a
                href={contact.bookingHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                data-cursor="talk"
              >
                {hero.primaryCta}
              </a>
              <a href={contact.emailHref} className="btn btn-ghost" data-cursor="talk">
                {hero.secondaryCta}
              </a>
            </div>

            {/* Proof, assembled from content that already exists: the approved
                quote's attribution, and where the apps can be downloaded. The
                first half disappears with the testimonial if it is withdrawn. */}
            <p className="hero-proof mono mt-8" data-hero-fade>
              {featuredTestimonial ? (
                <>
                  <span>
                    <span className="text-text">{featuredTestimonial.name}</span>
                    {`, ${featuredTestimonial.role}`}
                    {featuredTestimonial.company ? `, ${featuredTestimonial.company}` : ""}
                  </span>
                  <span className="hero-proof-dot" aria-hidden="true" />
                </>
              ) : null}
              <span>{hero.proof}</span>
            </p>
          </div>

          <HeroStack />
        </div>

        <div
          className="mono mt-12 flex items-center justify-between border-t border-line pt-5 text-muted md:mt-16"
          data-hero-fade
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>{hero.statusLabel}:</span>
            <span className="text-text" data-hero-status data-broken={hero.statusBroken}>
              {hero.statusFixed}
            </span>
          </span>
          <a href="#services" className="transition-colors hover:text-accent">
            {hero.scrollHint} ↓
          </a>
        </div>
      </div>
    </section>
  );
}

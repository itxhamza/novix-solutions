import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { featuredTestimonial } from "@/content/testimonials";
import { getFeatured } from "@/lib/content/projects";

/**
 * Home-page work grid: the projects flagged `featured` in content/projects.
 * The full grid with filters lives on /work.
 */
export function Work() {
  const { workSection } = site;
  const projects = getFeatured(3);

  return (
    <section id="work" className="relative py-28 md:py-44" aria-labelledby="work-title">
      <div className="shell">
        <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="eyebrow mb-6">{workSection.eyebrow}</p>
            <h2 id="work-title" className="display h-section">
              {workSection.title}
            </h2>
          </div>
          <p className="lede md:text-right">{workSection.intro}</p>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {projects.map((p) => {
            return (
              <li key={p.slug} className="wipe" data-wipe>
                <article className="tilt h-full" data-tilt>
                  <div className="tilt-inner flex flex-col gap-6 p-5 md:p-6" data-tilt-inner>
                    <div className="shot tilt-pop-sm">
                      <Image
                        src={p.thumbnail.src}
                        alt={p.thumbnail.alt}
                        width={p.thumbnail.width}
                        height={p.thumbnail.height}
                        sizes="(min-width: 768px) 30vw, 90vw"
                        className="tilt-pop"
                      />
                    </div>
                    <div className="tilt-pop-sm flex flex-1 flex-col">
                      <span className="mono text-accent">{p.platforms.join(" & ")}</span>
                      <h3 className="display mt-3 text-2xl md:text-3xl">
                        {/* Whole card is the hit area; the link keeps the accessible name. */}
                        <Link href={`/work/${p.slug}`} className="card-link">
                          {p.title}
                        </Link>
                      </h3>
                      {/* `result` is the one-line outcome; until one exists we show the summary. */}
                      <p className="mt-3 text-muted">{p.result ?? p.summary}</p>
                      <span className="mono mt-auto inline-flex items-center gap-2 pt-6 text-text">
                        {workSection.visitLabel} <span aria-hidden="true">→</span>
                      </span>
                    </div>
                    <span className="tilt-glare" data-tilt-glare aria-hidden="true" />
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="mt-12" data-reveal>
          <Link href="/work" className="btn btn-ghost">
            All projects <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Renders only once a real quote exists in content/testimonials.ts. */}
        {featuredTestimonial ? (
          <figure className="mt-20 border-t border-line pt-14 md:mt-32 md:pt-20" data-reveal>
            <span className="display block text-7xl leading-none text-accent md:text-9xl" aria-hidden="true">
              “
            </span>
            <blockquote className="display -mt-4 max-w-5xl text-2xl !leading-[1.15] !tracking-[-0.03em] md:-mt-8 md:text-5xl">
              {featuredTestimonial.text}
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span>
                <span className="block font-semibold">{featuredTestimonial.name}</span>
                <span className="block text-sm text-muted">{featuredTestimonial.role}</span>
              </span>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}

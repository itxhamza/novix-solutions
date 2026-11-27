import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getFeatured } from "@/lib/content/projects";

/**
 * Recent work as large alternating rows: screenshot one side, copy the other,
 * flipping each row.
 *
 * The featured band above already shows one project at full bleed, so that one
 * is left out here — at this size the repeat would be impossible to miss.
 * A project with no case study yet shows as a row without a link rather than
 * leading to a 404; see hasCaseStudy in lib/content/projects.ts.
 */
export function Work() {
  const { workSection } = site;
  const projects = getFeatured(4)
    .filter((p) => p.slug !== site.featuredCase)
    .slice(0, 3);

  if (projects.length === 0) return null;

  return (
    <section id="work" className="relative py-28 md:py-36" aria-labelledby="work-title">
      <div className="shell">
        <span className="divider mb-16" data-divider aria-hidden="true" />
        <div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          data-reveal
        >
          <div className="max-w-2xl">
            <p className="eyebrow mb-6">{workSection.eyebrow}</p>
            <h2 id="work-title" data-glitch className="display h-section">
              {workSection.title}
            </h2>
          </div>
          <p className="lede max-w-sm md:ml-auto md:text-right">{workSection.intro}</p>
        </div>

        <ul className="work-rows">
          {projects.map((p, i) => {
            const href = `/work/${p.slug}`;
            const media = (
              <span className="work-media tilt" data-tilt>
                <span className="work-media-inner tilt-inner" data-tilt-inner>
                  <Image
                    src={p.thumbnail.src}
                    alt={p.thumbnail.alt}
                    width={p.thumbnail.width}
                    height={p.thumbnail.height}
                    sizes="(min-width: 768px) 52vw, 92vw"
                    className="tilt-pop"
                  />
                  <span className="tilt-glare" data-tilt-glare aria-hidden="true" />
                </span>
              </span>
            );

            return (
              <li
                key={p.slug}
                className={`work-row${i % 2 === 1 ? " is-reversed" : ""}`}
                data-reveal
              >
                {p.hasCaseStudy ? (
                  <Link href={href} className="work-row-media" tabIndex={-1} aria-hidden="true">
                    {media}
                  </Link>
                ) : (
                  <div className="work-row-media">{media}</div>
                )}

                <div className="work-row-copy">
                  <span className="mono text-accent">{p.platforms.join(" & ")}</span>
                  <h3 className="display mt-4 text-3xl md:text-4xl">
                    {p.hasCaseStudy ? (
                      <Link href={href} className="work-row-link">
                        {p.title}
                      </Link>
                    ) : (
                      p.title
                    )}
                  </h3>
                  {/* `result` is the one-line outcome; the summary stands in. */}
                  <p className="lede mt-4">{p.result ?? p.summary}</p>
                  {p.hasCaseStudy ? (
                    <span className="mono mt-7 inline-flex items-center gap-2 text-text">
                      {workSection.visitLabel} <span aria-hidden="true">→</span>
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-16" data-reveal>
          <Link href="/work" className="btn btn-ghost">
            All projects <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

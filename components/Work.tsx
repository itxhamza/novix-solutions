import Image from "next/image";
import { site } from "@/content/site";

export function Work() {
  const { work } = site;
  return (
    <section id="work" className="relative py-28 md:py-44" aria-labelledby="work-title">
      <div className="shell">
        <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="eyebrow mb-6">{work.eyebrow}</p>
            <h2 id="work-title" className="display h-section">
              {work.title}
            </h2>
          </div>
          <p className="lede md:text-right">{work.intro}</p>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {work.projects.map((p) => (
            <li key={p.title} className="wipe" data-wipe>
              <article className="tilt h-full" data-tilt>
                <div className="tilt-inner flex flex-col gap-6 p-5 md:p-6" data-tilt-inner>
                  <div className={`shot tilt-pop-sm${p.image ? "" : " shot-empty"}`}>
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={`${p.title} screenshot`}
                        width={p.imageWidth}
                        height={p.imageHeight}
                        sizes="(min-width: 768px) 30vw, 90vw"
                        className="tilt-pop"
                      />
                    ) : (
                      <span className="mono">Screenshot</span>
                    )}
                  </div>
                  <div className="tilt-pop-sm flex flex-1 flex-col">
                    <span className="mono text-accent">{p.tag}</span>
                    <h3 className="display mt-3 text-2xl md:text-3xl">{p.title}</h3>
                    <p className="mt-3 text-muted">{p.description}</p>
                    {p.href ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono mt-auto inline-flex items-center gap-2 pt-6 text-text transition-colors hover:text-accent"
                        aria-label={`${work.visitLabel} ${p.title}`}
                      >
                        {work.visitLabel} <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                  </div>
                  <span className="tilt-glare" data-tilt-glare aria-hidden="true" />
                </div>
              </article>
            </li>
          ))}
        </ul>

        <figure className="mt-20 border-t border-line pt-14 md:mt-32 md:pt-20" data-reveal>
          <span className="display block text-7xl leading-none text-accent md:text-9xl" aria-hidden="true">
            “
          </span>
          <blockquote className="display -mt-4 max-w-5xl text-2xl !leading-[1.15] !tracking-[-0.03em] md:-mt-8 md:text-5xl">
            {work.testimonial.quote}
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span className="h-11 w-11 rounded-full border border-dashed border-muted/50" aria-hidden="true" />
            <span>
              <span className="block font-semibold">{work.testimonial.name}</span>
              <span className="block text-sm text-muted">{work.testimonial.role}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

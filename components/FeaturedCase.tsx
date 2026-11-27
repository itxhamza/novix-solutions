import Image from "next/image";
import Link from "next/link";
import { getProject } from "@/lib/content/projects";
import { site } from "@/content/site";

/**
 * One project at full bleed: the biggest thing on the page.
 *
 * The screenshot breaks out of the shell and rises out of a masked frame as it
 * scrolls in (lib/animations.ts). Everything comes from the project's own MDX,
 * and each part is hidden while its field is empty — the stat appears as soon
 * as `results` has an entry, and never before.
 */
export function FeaturedCase() {
  const project = getProject(site.featuredCase);
  if (!project) return null;

  const stat = project.results[0];
  const features = project.features.slice(0, 5);

  return (
    <section className="featured band-panel" aria-labelledby="featured-title">
      <div className="shell">
        <div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          data-reveal
        >
          <div className="max-w-2xl">
            <p className="eyebrow mb-6">Featured case study</p>
            <h2 id="featured-title" data-glitch className="display h-chapter">
              {project.title}
            </h2>
          </div>
          <p className="lede max-w-sm md:ml-auto md:text-right">{project.summary}</p>
        </div>
      </div>

      {/* Full bleed, and wider than 60vw at every breakpoint. */}
      <div className="featured-stage">
        <div className="featured-mask" data-featured-mask>
          <Image
            src={project.thumbnail.src}
            alt={project.thumbnail.alt}
            width={project.thumbnail.width}
            height={project.thumbnail.height}
            sizes="(min-width: 768px) 78vw, 94vw"
            className="featured-shot"
            data-featured-shot
          />
        </div>
      </div>

      <div className="shell">
        <div className="featured-foot">
          {stat ? (
            <p className="featured-stat" data-reveal>
              <span className="featured-stat-value">{stat.value}</span>
              <span className="featured-stat-label">{stat.label}</span>
            </p>
          ) : null}

          <div className="featured-foot-end" data-reveal>
            {features.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {features.map((f) => (
                  <li key={f} className="chip">
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}

            {project.hasCaseStudy ? (
              <Link href={`/work/${project.slug}`} className="btn btn-ghost mt-6">
                View the case study <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

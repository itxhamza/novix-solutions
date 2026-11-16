import Image from "next/image";
import Link from "next/link";
import { getProject } from "@/lib/content/projects";

/** Slug of the project shown in full on the home page. */
const FEATURED_SLUG = "bynaus-ai";

/**
 * One project, full width. Everything is pulled from its MDX file, and each
 * part is hidden while that field is empty — so the problem paragraph and the
 * results bullets appear as soon as the frontmatter has them.
 *
 * The screenshot sits in a browser frame that tilts with the cursor; the tilt
 * is bound by lib/animations.ts and is skipped for reduced motion and on
 * touch devices.
 */
export function FeaturedCase() {
  const project = getProject(FEATURED_SLUG);
  if (!project) return null;

  const results = project.results.slice(0, 3);

  return (
    <section className="relative py-28 md:py-36" aria-labelledby="featured-title">
      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-6">Featured case study</p>
            <h2 id="featured-title" className="display h-section">
              {project.title}
            </h2>
            <p className="lede mt-6">{project.summary}</p>

            {/* What we built — hidden until the MDX lists features. */}
            {project.features.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {project.features.map((f) => (
                  <li key={f} className="chip">
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Results — only ever real numbers from the frontmatter. */}
            {results.length > 0 ? (
              <ul className="check-list mt-10">
                {results.map((r) => (
                  <li key={r.label}>
                    <svg className="check-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                    <span>
                      <strong className="text-text">{r.value}</strong> {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {project.hasCaseStudy ? (
              <Link href={`/work/${project.slug}`} className="btn btn-ghost mt-10">
                View the case study <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>

          <div className="parallax" data-parallax data-reveal>
            <figure className="frame frame-browser parallax-inner" data-parallax-inner>
              <span className="frame-bar" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div
                className="frame-screen"
                style={{ aspectRatio: `${project.thumbnail.width} / ${project.thumbnail.height}` }}
              >
                <Image
                  src={project.thumbnail.src}
                  alt={project.thumbnail.alt}
                  width={project.thumbnail.width}
                  height={project.thumbnail.height}
                  sizes="(min-width: 1024px) 55vw, 90vw"
                />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

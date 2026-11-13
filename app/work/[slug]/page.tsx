import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PageShell } from "@/components/PageShell";
import { Gallery } from "@/components/Gallery";
import { site } from "@/content/site";
import { appStoreId, getProject, getProjectSlugs, nextProject } from "@/lib/content/projects";
import { getAppStoreRating } from "@/lib/ratings";

/** Refresh the App Store rating daily; everything else is static. */
export const revalidate = 86400;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — case study`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title,
      description: project.summary,
      url: `/work/${project.slug}`,
      type: "article",
      // The OG image comes from opengraph-image.tsx in this folder.
    },
  };
}

/** Section wrapper: renders nothing at all when it has no content. */
function Block({
  title,
  children,
  show = true,
}: {
  title: string;
  children: React.ReactNode;
  show?: boolean;
}) {
  if (!show) return null;
  return (
    <section className="case-block" data-reveal>
      <h2 className="mono case-block-title">{title}</h2>
      <div className="case-block-body">{children}</div>
    </section>
  );
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  // No page for a project with nothing under the header — see hasCaseStudy in
  // lib/content/projects.ts. /work links to those as plain tiles.
  if (!project?.hasCaseStudy) notFound();

  const storeId = appStoreId(project);
  const rating = storeId ? await getAppStoreRating(storeId) : undefined;
  const next = nextProject(project.slug);

  const links = [
    { label: "App Store", href: project.links.appStore },
    { label: "Google Play", href: project.links.googlePlay },
    { label: "Live site", href: project.links.website },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${site.url}/work/${project.slug}`,
    image: `${site.url}${project.thumbnail.src}`,
    ...(project.year ? { dateCreated: project.year } : {}),
    creator: { "@type": "Organization", name: site.name, url: site.url },
  };

  return (
    <PageShell>
      <article className="relative pb-28 pt-36 md:pb-44 md:pt-48">
        <div className="shell">
          {/* 1 — Title, summary, tags, year, role, links */}
          <header className="max-w-4xl" data-reveal>
            <Link href="/work" className="mono text-muted transition-colors hover:text-accent">
              <span aria-hidden="true">←</span> All work
            </Link>
            <h1 className="display h-section mt-8">{project.title}</h1>
            <p className="lede mt-6 max-w-2xl">{project.summary}</p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {project.platforms.map((p) => (
                <li key={p} className="chip">
                  {p}
                </li>
              ))}
              {project.type ? <li className="chip">{project.type}</li> : null}
            </ul>

            {project.year || project.role || project.client || rating ? (
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
                {project.client ? (
                  <div>
                    <dt className="mono text-muted">Client</dt>
                    <dd className="mt-1 font-semibold">{project.client}</dd>
                  </div>
                ) : null}
                {project.year ? (
                  <div>
                    <dt className="mono text-muted">Year</dt>
                    <dd className="mt-1 font-semibold">{project.year}</dd>
                  </div>
                ) : null}
                {project.role ? (
                  <div>
                    <dt className="mono text-muted">Role</dt>
                    <dd className="mt-1 font-semibold">{project.role}</dd>
                  </div>
                ) : null}
                {/* Live from the App Store; absent if the lookup gave nothing. */}
                {rating ? (
                  <div>
                    <dt className="mono text-muted">App Store</dt>
                    <dd className="mt-1 font-semibold">
                      {rating.average.toFixed(1)}★{" "}
                      <span className="font-normal text-muted">
                        ({rating.count.toLocaleString()} ratings)
                      </span>
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {links.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-3">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            ) : null}
          </header>

          {/* 2 — The problem (MDX body) */}
          <Block title="Overview" show={project.hasBody}>
            <div className="prose-case">
              <MDXRemote source={project.body} />
            </div>
          </Block>

          {/* 3 — What we built */}
          <Block title="What we built" show={project.features.length > 0}>
            <ul className="feature-list">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Block>

          {/* 4 — Tech stack */}
          <Block title="Tech stack" show={project.stack.length > 0}>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          </Block>

          {/* 5 — Screenshots */}
          <Block title="Screens" show={project.gallery.length > 0}>
            <Gallery shots={project.gallery} />
          </Block>

          {/* 6 — Results: only real numbers, supplied in frontmatter */}
          <Block title="Results" show={project.results.length > 0}>
            <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {project.results.map((r) => (
                <div key={r.label}>
                  <dt className="mono text-muted">{r.label}</dt>
                  <dd className="display mt-2 text-4xl text-accent md:text-5xl">{r.value}</dd>
                </div>
              ))}
            </dl>
          </Block>

          {/* 7 — Client quote */}
          {project.quote ? (
            <figure className="case-block" data-reveal>
              <blockquote className="display max-w-4xl text-2xl !leading-[1.2] md:text-4xl">
                “{project.quote.text}”
              </blockquote>
              <figcaption className="mt-6">
                <span className="block font-semibold">{project.quote.name}</span>
                <span className="block text-sm text-muted">{project.quote.role}</span>
              </figcaption>
            </figure>
          ) : null}

          {/* 8 — Next project and contact */}
          <div className="mt-24 flex flex-col gap-10 border-t border-line pt-14 md:flex-row md:items-end md:justify-between" data-reveal>
            {next ? (
              <Link href={`/work/${next.slug}`} className="group">
                <span className="mono text-muted">Next project</span>
                <span className="display mt-3 block text-3xl transition-colors group-hover:text-accent md:text-5xl">
                  {next.title} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            <a href={site.contact.bookingHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-cursor="talk">
              {site.hero.primaryCta}
            </a>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </PageShell>
  );
}

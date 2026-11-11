import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { about, aboutNumbers, aboutTeam, storyParagraphs } from "@/content/about";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const title = "About — Novix Solutions";
const description =
  "Novix Solutions is a software studio that builds and rescues mobile and web apps for businesses in the US and the Gulf.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/about" });

export default function AboutPage() {
  const { hero, story, whatWeDo, howWeWork, founder, cta } = about;

  /**
   * Only facts that appear in the copy above; empty fields are left out.
   *
   * The organisation itself is already described site-wide in app/layout.tsx
   * (ProfessionalService, a subtype of Organization) under this same @id.
   * This references that node rather than declaring a second entity with the
   * same identifier, and adds the founder relationship in both directions.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${site.url}/#organization`,
        founder: { "@id": `${site.url}/about#founder` },
      },
      {
        "@type": "Person",
        "@id": `${site.url}/about#founder`,
        name: founder.name,
        jobTitle: founder.role,
        description: founder.bio,
        email: site.contact.email,
        worksFor: { "@id": `${site.url}/#organization` },
        ...(founder.linkedin ? { sameAs: [founder.linkedin] } : {}),
        ...(founder.photo ? { image: `${site.url}${founder.photo}` } : {}),
      },
    ],
  };

  return (
    <PageShell>
      {/* 1 — Hero */}
      <section className="relative pt-36 md:pt-48" aria-labelledby="about-title">
        <div className="shell">
          <div className="max-w-4xl" data-reveal>
            <p className="eyebrow mb-6">{hero.eyebrow}</p>
            <h1 id="about-title" className="display h-section">
              {hero.headline}
            </h1>
            <p className="lede mt-6 max-w-2xl">{hero.subline}</p>
          </div>
        </div>
      </section>

      {/* 2 — Our story, in a narrow reading column */}
      <section className="relative py-20 md:py-28" aria-labelledby="story-title">
        <div className="shell">
          <div className="max-w-2xl" data-reveal>
            <h2 id="story-title" className="display h-panel">
              {story.heading}
            </h2>
            <div className="prose-case mt-8">
              {storyParagraphs().map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 — What we do */}
      <section className="relative border-t border-line py-20 md:py-28" aria-labelledby="whatwedo-title">
        <div className="shell">
          <h2 id="whatwedo-title" className="display h-panel" data-reveal>
            {whatWeDo.heading}
          </h2>
          <dl className="mt-12 grid gap-10 md:grid-cols-3">
            {whatWeDo.items.map((item) => (
              <div key={item.title} data-reveal>
                <dt className="display text-2xl text-accent">{item.title}</dt>
                <dd className="mt-3 text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12" data-reveal>
            <Link href={whatWeDo.link.href} className="btn btn-ghost">
              {whatWeDo.link.label} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 — How we work, as a checklist */}
      <section className="relative border-t border-line py-20 md:py-28" aria-labelledby="howwework-title">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <h2 id="howwework-title" className="display h-panel" data-reveal>
            {howWeWork.heading}
          </h2>
          <div data-reveal>
            <ul className="check-list">
              {howWeWork.points.map((point) => (
                <li key={point}>
                  <svg className="check-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link href={howWeWork.link.href} className="btn btn-ghost mt-10">
              {howWeWork.link.label} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5 — Founder */}
      <section className="relative border-t border-line py-20 md:py-28" aria-labelledby="founder-title">
        <div className="shell">
          <h2 id="founder-title" className="display h-panel" data-reveal>
            {founder.heading}
          </h2>

          <div className="founder-card mt-12" data-reveal>
            {/* Hidden until a real photo is in place. */}
            {founder.photo ? (
              <Image
                src={founder.photo}
                alt={founder.photoAlt || founder.name}
                width={520}
                height={620}
                sizes="(min-width: 768px) 32vw, 90vw"
                className="founder-photo"
              />
            ) : null}

            <div>
              <p className="display text-3xl md:text-4xl">{founder.name}</p>
              <p className="mono mt-3 text-accent">{founder.role}</p>
              <p className="mt-6 max-w-xl text-muted">{founder.bio}</p>

              <ul className="mt-8 flex flex-wrap gap-3">
                {founder.linkedin ? (
                  <li>
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                    >
                      LinkedIn <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ) : null}
                <li>
                  <a href={site.contact.emailHref} className="btn btn-ghost btn-sm">
                    {site.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — Team: renders only once content/about.ts has members */}
      {aboutTeam.length > 0 ? (
        <section className="relative border-t border-line py-20 md:py-28" aria-labelledby="team-title">
          <div className="shell">
            <h2 id="team-title" className="display h-panel" data-reveal>
              The team
            </h2>
            <ul className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {aboutTeam.map((person) => (
                <li key={person.name} data-reveal>
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      width={400}
                      height={480}
                      sizes="(min-width: 1024px) 30vw, 45vw"
                      className="mb-5 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <p className="display text-2xl">{person.name}</p>
                  <p className="mono mt-2 text-accent">{person.role}</p>
                  {person.bio ? <p className="mt-3 text-muted">{person.bio}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 7 — Numbers: only the stats that have a value */}
      {aboutNumbers.length > 0 ? (
        <section className="relative border-t border-line py-16" aria-label="Novix in numbers">
          <div className="shell">
            <dl className="grid gap-10 sm:grid-cols-3" data-reveal>
              {aboutNumbers.map((stat) => (
                <div key={stat.label}>
                  <dt className="display text-4xl text-accent md:text-6xl">{stat.value}</dt>
                  <dd className="mono mt-3 text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* 8 — Closing call to action */}
      <section className="relative border-t border-line py-20 md:py-28" aria-labelledby="about-cta-title">
        <div className="shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div data-reveal>
            <h2 id="about-cta-title" className="display h-section max-w-3xl">
              {cta.heading}
            </h2>
            <p className="lede mt-6">{cta.body}</p>
          </div>
          <div className="flex flex-wrap gap-3" data-reveal>
            <a
              href={site.contact.bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              data-cursor="talk"
            >
              {cta.primary}
            </a>
            <a href={site.contact.emailHref} className="btn btn-ghost" data-cursor="talk">
              {cta.secondary}
            </a>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </PageShell>
  );
}

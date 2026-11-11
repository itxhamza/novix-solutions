import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { aboutSection, howWeWork, team } from "@/content/about";
import { site } from "@/content/site";

const title = "About — Novix Solutions";
const description =
  "Novix Solutions is a software agency in Lahore, Pakistan, building and rescuing mobile and web apps for clients in the US and the Gulf.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/about" });

export default function AboutPage() {
  return (
    <PageShell>
      <section className="relative pt-36 md:pt-48" aria-labelledby="about-title">
        <div className="shell">
          <div className="max-w-4xl" data-reveal>
            <p className="eyebrow mb-6">{aboutSection.eyebrow}</p>
            <h1 id="about-title" className="display h-section">
              {aboutSection.title}
            </h1>
            <p className="lede mt-6">{aboutSection.intro}</p>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="shell">
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {howWeWork.map((item) => (
              <div key={item.title} className="bg-bg p-8 md:p-10" data-reveal>
                <dt className="display text-xl md:text-2xl">{item.title}</dt>
                <dd className="mt-4 text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>

          {/* Team section appears as soon as content/about.ts has an entry. */}
          {team.length > 0 ? (
            <div className="mt-24" data-reveal>
              <h2 className="display h-panel">Who you work with</h2>
              <ul className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {team.map((person) => (
                  <li key={person.name}>
                    <h3 className="display text-2xl">{person.name}</h3>
                    <p className="mono mt-2 text-accent">{person.role}</p>
                    {person.bio ? <p className="mt-4 text-muted">{person.bio}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-24 flex flex-col gap-6 border-t border-line pt-14 md:flex-row md:items-center md:justify-between" data-reveal>
            <h2 className="display text-3xl md:text-5xl">See what we have shipped.</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/work" className="btn btn-ghost">
                View work <span aria-hidden="true">→</span>
              </Link>
              <a
                href={site.contact.bookingHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                data-cursor="talk"
              >
                {site.hero.primaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

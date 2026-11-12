import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { services, servicesSection } from "@/content/services";
import { getProject } from "@/lib/content/projects";

const title = "Services — build, rescue or extend your app";
const description =
  "Three ways Novix Solutions works with you: new mobile and web apps, app rescue and takeover, and dedicated React Native and Node.js developers.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/services" });

export default function ServicesPage() {
  return (
    <PageShell>
      <section className="relative pt-36 md:pt-48" aria-labelledby="services-title">
        <div className="shell">
          <div className="max-w-4xl" data-reveal>
            <p className="eyebrow mb-6">{servicesSection.eyebrow}</p>
            <h1 id="services-title" className="display h-section">
              {servicesSection.title}
            </h1>
            <p className="lede mt-6">{servicesSection.intro}</p>
          </div>
        </div>
      </section>

      {services.map((service, i) => {
        // Only slugs that resolve to a real project are linked.
        const related = service.caseStudies
          .map((slug) => getProject(slug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));

        return (
          <section
            key={service.id}
            id={service.id}
            className="relative border-t border-line py-20 md:py-28"
            aria-labelledby={`${service.id}-title`}
          >
            <div className="shell grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20" data-reveal>
              <div>
                <span className="mono text-accent">
                  {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                </span>
                <h2 id={`${service.id}-title`} className="display h-panel mt-5">
                  {service.title}
                </h2>
                <p className="mt-5 max-w-md text-muted">{service.body}</p>
              </div>

              <div className="grid gap-10">
                <div>
                  <h3 className="mono text-muted">What&rsquo;s included</h3>
                  <ul className="feature-list mt-5">
                    {service.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Hidden until the real answer exists. */}
                {service.forWho ? (
                  <div>
                    <h3 className="mono text-muted">Who it&rsquo;s for</h3>
                    <p className="mt-4 max-w-xl text-muted">{service.forWho}</p>
                  </div>
                ) : null}

                {service.pricing ? (
                  <div>
                    <h3 className="mono text-muted">How pricing works</h3>
                    <p className="mt-4 max-w-xl text-muted">{service.pricing}</p>
                  </div>
                ) : null}

                {related.length > 0 ? (
                  <div>
                    <h3 className="mono text-muted">Related work</h3>
                    <ul className="mt-4 flex flex-wrap gap-3">
                      {related.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/work/${p.slug}`} className="btn btn-ghost btn-sm">
                            {p.title} <span aria-hidden="true">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}

      <section className="relative border-t border-line py-20 md:py-28">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between" data-reveal>
          <h2 className="display text-3xl md:text-5xl">Not sure which one you need?</h2>
          <Link href="/contact" className="btn btn-primary" data-cursor="talk">
            Tell us what&rsquo;s going on <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

import Link from "next/link";
import { site } from "@/content/site";

/**
 * Home-page contact call-to-action. The full form lives on /contact, so the
 * home page stays short.
 */
export function HomeCta() {
  const { contactSection: c, contact } = site;

  return (
    <section id="contact" className="relative py-28 md:py-44" aria-labelledby="home-cta-title">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end" data-reveal>
          <div>
            <p className="eyebrow mb-6">{c.eyebrow}</p>
            <h2 id="home-cta-title" className="display h-section">
              {c.title}
            </h2>
            <p className="lede mt-6">{c.intro}</p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/contact" className="btn btn-primary" data-cursor="talk">
              {c.form.submit} <span aria-hidden="true">→</span>
            </Link>
            <a
              href={contact.bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              data-cursor="talk"
            >
              {c.scheduleCta}
            </a>
          </div>
        </div>

        <dl className="mt-16 grid gap-8 border-t border-line pt-10 sm:grid-cols-3" data-reveal>
          <div>
            <dt className="mono text-muted">{c.whatsappLabel}</dt>
            <dd className="mt-2">
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                {contact.whatsappDisplay}
              </a>
            </dd>
          </div>
          <div>
            <dt className="mono text-muted">{c.emailLabel}</dt>
            <dd className="mt-2">
              <a href={contact.emailHref} className="transition-colors hover:text-accent">
                {contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="mono text-muted">{c.locationLabel}</dt>
            <dd className="mt-2">{site.location}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

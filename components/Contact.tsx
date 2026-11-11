import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";

export function Contact() {
  const { contactSection: c, contact } = site;
  return (
    <section id="contact" className="relative py-28 md:py-44" aria-labelledby="contact-title">
      <div className="shell grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div data-reveal>
          <p className="eyebrow mb-6">{c.eyebrow}</p>
          <h2 id="contact-title" className="display h-section">
            {c.title}
          </h2>
          <p className="lede mt-6">{c.intro}</p>

          <dl className="mt-12 grid gap-8">
            <div>
              <dt className="mono text-muted">{c.whatsappLabel}</dt>
              <dd className="mt-2">
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-xl font-semibold tracking-tight transition-colors hover:text-accent md:text-2xl"
                  data-cursor="talk"
                >
                  {contact.whatsappDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="mono text-muted">{c.emailLabel}</dt>
              <dd className="mt-2">
                <a
                  href={contact.emailHref}
                  className="font-display text-xl font-semibold tracking-tight transition-colors hover:text-accent md:text-2xl"
                  data-cursor="talk"
                >
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="mono text-muted">{c.locationLabel}</dt>
              <dd className="mt-2 text-lg">{site.location}</dd>
            </div>
          </dl>
        </div>

        <div data-reveal>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

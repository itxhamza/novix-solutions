import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";

/**
 * Shared by the home page (as a section, h2) and /contact (as the page, h1),
 * so the contact details and form only exist in one place.
 */
export function Contact({ heading = "h2" }: { heading?: "h1" | "h2" }) {
  const { contactSection: c, contact } = site;
  const Heading = heading;
  return (
    <section id="contact" className="relative py-28 md:py-44" aria-labelledby="contact-title">
      <div className="shell grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div data-reveal>
          <p className="eyebrow mb-6">{c.eyebrow}</p>
          <Heading id="contact-title" className="display h-section">
            {c.title}
          </Heading>
          <p className="lede mt-6">{c.intro}</p>

          <dl className="mt-12 grid gap-8">
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
          </dl>
        </div>

        <div data-reveal>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

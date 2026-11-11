import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

export function Footer() {
  const { contact, footer } = site;

  return (
    <footer className="relative z-10 border-t border-line pt-16 pb-10">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label={`${site.name} — home`}>
              <Image
                src={site.brand.footerLogo}
                alt=""
                width={963}
                height={311}
                unoptimized
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm text-muted">{footer.line}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="mono text-muted">Pages</h2>
            <ul className="mt-5 grid gap-3">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mono text-muted">Contact</h2>
            <ul className="mt-5 grid gap-3 text-sm">
              <li>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {contact.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={contact.emailHref} className="transition-colors hover:text-accent">
                  {contact.email}
                </a>
              </li>
              <li className="text-muted">{site.location}</li>
            </ul>

            {/* Only channels with a real URL are listed. */}
            {footer.social.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {footer.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted transition-colors hover:text-accent"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}.
          </p>
          <Link href="/privacy" className="transition-colors hover:text-accent">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

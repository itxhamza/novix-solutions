import Link from "next/link";
import { site } from "@/content/site";
import { Logo } from "./Logo";

/**
 * The last thing on every page, and the second place people look for a way to
 * get in touch — so it carries real weight rather than a single thin row.
 *
 * Everything here already exists in content/site.ts. Social is its own column
 * instead of being squeezed under the address, and renders only the channels
 * that have a real URL.
 *
 * "Back to top" is a plain #top link, not a script: with no element of that
 * id the HTML spec sends the browser to the top of the document, so it works
 * with JS off, and the smooth scroll comes from scroll-behavior — which the
 * reduced-motion block already turns off.
 */
export function Footer() {
  const { contact, footer } = site;

  return (
    <footer className="site-footer relative z-10">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-lead">
            <Link href="/" aria-label={`${site.name} — home`}>
              <Logo className="footer-logo" />
            </Link>
            <p className="footer-line">{footer.line}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="mono text-muted">Pages</h2>
            <ul className="mt-5 grid gap-3">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mono text-muted">Contact</h2>
            <ul className="mt-5 grid gap-3">
              <li>
                <a href={contact.emailHref} className="footer-email">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>

          {footer.social.length > 0 ? (
            <div>
              <h2 className="mono text-muted">Elsewhere</h2>
              <ul className="mt-5 grid gap-3">
                {footer.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="footer-base">
          <p>
            © {new Date().getFullYear()} {site.name}.
          </p>

          <div className="footer-legal">
            <Link href="/privacy" className="footer-link">
              Privacy policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms
            </Link>
          </div>

          <a href="#top" className="to-top">
            Back to top
            <span className="to-top-arrow" aria-hidden="true">
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

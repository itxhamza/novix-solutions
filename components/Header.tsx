"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { scrollToSection } from "./ScrollManager";

/** /work also owns /work/<slug>, so a case study keeps "Work" highlighted. */
function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

  // The bar shrinks once you leave the top of the page. The ref keeps the
  // listener from calling setState on every scroll frame — only the crossing
  // matters, not the position. Heights live in CSS so the transition shares
  // the one easing token; reduced motion zeroes the duration globally.
  const isCondensed = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      if (next === isCondensed.current) return;
      isCondensed.current = next;
      setCondensed(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Safety net: close the menu if the route changes any other way. Links close
  // it themselves, because "/#process" from the home page never changes the
  // pathname — this effect would not fire, and the open menu would sit over the
  // section the tap just scrolled to.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 ${condensed ? "is-condensed" : ""}`}
      data-header
    >
      <div className="shell header-bar flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          {/* Taller than the name-only mark so "SOLUTIONS" stays legible. */}
          <Logo className="header-logo" draw />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`nav-link${current ? " is-current" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* The utility lives on the wrapper: .btn sets its own display and
              would otherwise beat `hidden` on source order. */}
          <span className="hidden sm:block">
            <a
              href={site.contact.bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              data-cursor="talk"
            >
              {site.hero.primaryCta}
            </a>
          </span>

          <button
            type="button"
            className="menu-toggle md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`menu-bars${open ? " is-open" : ""}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      {/* How far down the page you are. Decorative, and only drawn once the
          animation layer is live — without JS it would sit at zero forever. */}
      <span className="scroll-progress" data-scroll-progress aria-hidden="true" />

      {/* Mobile menu. Rendered only when open so nothing is focusable behind. */}
      {open ? (
        <div id="mobile-menu" className="mobile-menu md:hidden">
          <nav aria-label="Main" className="shell flex flex-col gap-1 py-6">
            {site.nav.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`mobile-link${current ? " is-current" : ""}`}
                  onClick={() => {
                    setOpen(false);
                    // A same-page section link never changes the route, so
                    // nothing else scrolls for it. The menu also locks the
                    // body, and React lifts that lock a beat later — lift it
                    // here so the scroll below is not swallowed.
                    if (!item.href.includes("#") || pathname !== "/") return;
                    const hash = item.href.slice(item.href.indexOf("#"));
                    document.body.style.overflow = "";
                    requestAnimationFrame(() => scrollToSection(hash));
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={site.contact.bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-5"
              onClick={() => setOpen(false)}
            >
              {site.hero.primaryCta}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

import Image from "next/image";
import { site } from "@/content/site";

export function Header() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50" data-header>
      <div className="shell flex h-16 items-center justify-between md:h-20">
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${site.name} — home`}>
          <Image src="/brand/novix-mark.svg" alt="" width={34} height={24} priority unoptimized />
          <span className="font-display text-xl font-bold tracking-tight">{site.shortName}</span>
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href={site.contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          data-cursor="talk"
        >
          {site.hero.primaryCta}
        </a>
      </div>
    </header>
  );
}

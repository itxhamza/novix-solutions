import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line py-10">
      <div className="shell flex flex-col gap-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. {site.footer.line}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {site.footer.social.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

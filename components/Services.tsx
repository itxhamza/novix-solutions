import Link from "next/link";
import { services, servicesSection } from "@/content/services";
import { ServiceDemo, hasServiceDemo } from "./Demos";

/**
 * Three service panels, scrolled sideways while the section is pinned.
 *
 * The heading is deliberately outside the track: as a fourth panel it used
 * up a screen of travel without being a service, and left the run starting
 * on a half-empty frame. Each panel is now exactly one frame wide, so the
 * pin lasts exactly as long as the panels need and no longer.
 */
export function Services() {
  const total = String(services.length).padStart(2, "0");

  return (
    <section id="services" data-services className="relative" aria-labelledby="services-title">
      <div className="shell services-head" data-reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-6">{servicesSection.eyebrow}</p>
            <h2 id="services-title" data-glitch className="display h-section">
              {servicesSection.title}
            </h2>
          </div>
          <div className="md:text-right">
            <p className="lede max-w-sm md:ml-auto">{servicesSection.intro}</p>
            <Link href="/services" className="btn btn-ghost btn-sm mt-6">
              All services <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="services-pin" data-services-pin>
        <div className="services-track" data-services-track>
          {services.map((item) => (
            <article key={item.id} className="panel" data-panel>
              <div className="panel-copy" data-panel-copy>
                <p className="mono text-accent">{item.tag}</p>
                <h3 className="display h-panel">{item.title}</h3>
                <p className="lede">{item.body}</p>
                <ul className="flex flex-wrap gap-2">
                  {item.points.map((p) => (
                    <li key={p} className="chip">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* A panel with no demo content drops the column rather than
                  reserving an empty one — see hasServiceDemo in Demos.tsx. */}
              {hasServiceDemo(item.id) ? (
                <div className="panel-demo">
                  <ServiceDemo id={item.id} />
                  {item.demoLabel ? (
                    <span className="demo-label mono">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                      {item.demoLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>

        {/* One counter for the whole run, advanced by lib/animations.ts. */}
        <div className="services-hud" aria-hidden="true">
          <p className="mono">
            <span className="text-accent" data-services-count>
              01
            </span>{" "}
            / {total}
          </p>
          <div className="services-bar">
            <span data-services-progress />
          </div>
        </div>
      </div>
    </section>
  );
}

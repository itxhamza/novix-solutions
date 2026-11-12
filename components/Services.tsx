import Link from "next/link";
import { services, servicesSection } from "@/content/services";
import { ServiceDemo, hasServiceDemo } from "./Demos";

export function Services() {
  return (
    <section id="services" data-services className="relative py-24 md:py-0" aria-labelledby="services-title">
      <div className="services-pin" data-services-pin>
        <div className="services-track" data-services-track>
          <div className="panel panel-intro pb-6 md:pb-0">
            <div data-reveal>
              <p className="eyebrow mb-6">{servicesSection.eyebrow}</p>
              <h2 id="services-title" className="display h-section">
                {servicesSection.title}
              </h2>
              <p className="lede mt-6">{servicesSection.intro}</p>
              <Link href="/services" className="btn btn-ghost btn-sm mt-8">
                All services <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {services.map((item, i) => {
            const showDemo = hasServiceDemo(item.id);
            return (
            <article key={item.id} className={`panel${showDemo ? "" : " panel-solo"}`} data-panel>
              <div className="panel-copy" data-panel-copy>
                <div className="mono flex items-center justify-between text-muted">
                  <span className="text-accent">
                    {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                  </span>
                  <span>{item.tag}</span>
                </div>
                <div>
                  <h3 className="display h-panel">{item.title}</h3>
                  <p className="mt-5 max-w-md text-muted">{item.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {item.points.map((p) => (
                      <li key={p} className="chip">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {showDemo ? (
                <div className="panel-demo">
                  <ServiceDemo id={item.id} />
                  <span className="mono absolute top-5 left-5 flex items-center gap-2 text-muted">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    {item.demoLabel}
                  </span>
                </div>
              ) : null}
            </article>
            );
          })}
        </div>

        <div className="services-progress shell mt-8" aria-hidden="true">
          <div className="h-px w-full bg-line">
            <div className="h-px origin-left scale-x-0 bg-accent" data-services-progress />
          </div>
        </div>
      </div>
    </section>
  );
}

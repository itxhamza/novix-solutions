import { weeklySection, weeklyStops } from "@/content/weekly";

/**
 * One project week as a horizontal timeline. A light beam travels the line on
 * scroll and each stop lights as it passes — driven by lib/animations.ts.
 *
 * The stops are rendered lit-by-default in CSS; the script only dims the ones
 * the beam has not reached yet, so reduced motion and no-JS show the finished,
 * fully readable timeline.
 */
export function Weekly() {
  return (
    <section className="relative py-28 md:py-36" aria-labelledby="weekly-title">
      <div className="shell">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow mb-6">{weeklySection.eyebrow}</p>
          <h2 id="weekly-title" className="display h-section">
            {weeklySection.title}
          </h2>
          <p className="lede mt-6">{weeklySection.intro}</p>
        </div>

        <ol className="week" data-week>
          <div className="week-track" aria-hidden="true">
            <div className="week-fill" data-week-fill />
          </div>
          {weeklyStops.map((stop) => (
            <li key={stop.when} className="week-stop" data-week-stop>
              <span className="week-node" aria-hidden="true" />
              <p className="mono text-accent">{stop.when}</p>
              <p className="display mt-3 text-2xl md:text-3xl">{stop.title}</p>
              <p className="mt-3 text-muted">{stop.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

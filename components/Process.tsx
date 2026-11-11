import Link from "next/link";
import { processSection, processSteps } from "@/content/process";

// Stroke icons. Every path has pathLength=1 so it can draw itself.
const ICONS: Record<string, string[]> = {
  scope: ["M7 3h8l4 4v14H7z", "M15 3v4h4", "M10 12h6", "M10 16h4"],
  milestone: ["M6 21V4", "M6 4h11l-2.5 4L17 12H6"],
  updates: ["M4 12a8 8 0 0 1 14-5.3L20 9", "M20 4v5h-5", "M20 12a8 8 0 0 1-14 5.3L4 15", "M4 20v-5h5"],
  support: ["M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.800-7-5.500-7-10V6z", "M9 12l2.200 2.200L15.500 10"],
};

export function Process() {
  return (
    <section id="process" data-process className="relative py-28 md:py-44" aria-labelledby="process-title">
      <div className="shell grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start" data-reveal>
          <p className="eyebrow mb-6">{processSection.eyebrow}</p>
          <h2 id="process-title" className="display h-section">
            {processSection.title}
          </h2>
          <p className="lede mt-6">{processSection.intro}</p>
          <Link href="/process" className="btn btn-ghost btn-sm mt-8">
            Full process <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ol className="relative" data-beam>
          <div className="beam-track" aria-hidden="true">
            <div className="beam-fill" data-beam-fill />
            <div className="beam-head" data-beam-head />
          </div>
          {processSteps.map((step, i) => (
            <li key={step.title} className="step relative pb-20 pl-20 last:pb-0 md:pb-28 md:pl-28" data-step>
              <div className="step-node" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {ICONS[step.icon].map((d) => (
                    <path key={d} d={d} pathLength={1} data-draw />
                  ))}
                </svg>
              </div>
              <div className="step-body">
                <div className="step-num mono mb-3 !text-sm" data-step-num data-value={i + 1} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="display text-2xl md:text-4xl">{step.title}</h3>
                <p className="mt-4 max-w-md text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

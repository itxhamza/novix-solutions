import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { processSection, processSteps } from "@/content/process";

const title = "Process — how we run a project";
const description =
  "Scope agreed in writing, milestone-based payment, progress updates every few days, and support after launch. The same four steps on every Novix Solutions project.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/process" });

export default function ProcessPage() {
  return (
    <PageShell>
      <section className="relative pt-36 md:pt-48" aria-labelledby="process-title">
        <div className="shell">
          <div className="max-w-4xl" data-reveal>
            <p className="eyebrow mb-6">{processSection.eyebrow}</p>
            <h1 id="process-title" className="display h-section">
              {processSection.title}
            </h1>
            <p className="lede mt-6">{processSection.intro}</p>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="shell">
          <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line">
            {processSteps.map((step, i) => (
              <li key={step.title} className="bg-bg p-8 md:p-12" data-reveal>
                <div className="grid gap-6 md:grid-cols-[6rem_1fr] md:gap-10">
                  <span className="display text-4xl text-accent md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="display text-2xl md:text-4xl">{step.title}</h2>
                    <p className="mt-4 max-w-2xl text-muted">{step.body}</p>

                    {/* "What you receive" — hidden until the real list exists. */}
                    {step.deliverables.length > 0 ? (
                      <div className="mt-8">
                        <h3 className="mono text-muted">What you receive</h3>
                        <ul className="feature-list mt-4">
                          {step.deliverables.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-16 flex flex-col gap-6 md:flex-row md:items-center md:justify-between" data-reveal>
            <h2 className="display text-3xl md:text-5xl">Ready to start?</h2>
            <Link href="/contact" className="btn btn-primary" data-cursor="talk">
              Get in touch <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import { site } from "@/content/site";

/**
 * Counters. A counter renders only once its value is set in content/site.ts,
 * and the whole strip disappears while every value is empty — no zeroes, no
 * invented figures.
 *
 * The count-up is driven by lib/animations.ts; the finished number is what is
 * in the HTML, so reduced motion and no-JS both show the real value.
 */
export function Stats() {
  const stats = site.stats.filter((s) => s.value.trim());
  if (stats.length === 0) return null;

  return (
    <section className="relative border-y border-line py-16 md:py-20" aria-label="Novix in numbers">
      <div className="shell">
        <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4" data-stats>
          {stats.map((stat) => (
            <div key={stat.label} data-reveal>
              <dt className="display text-4xl text-accent md:text-6xl" data-stat-value={stat.value}>
                {stat.value}
              </dt>
              <dd className="mono mt-3 text-muted">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

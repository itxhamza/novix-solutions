import Image from "next/image";
import { tech } from "@/content/tech";

/**
 * Infinite technology strip under the hero.
 *
 * The animation is pure CSS, so there is no JS cost and no hydration work:
 * the list is rendered twice and translated by -50%, which loops seamlessly.
 * Hover pauses it, and prefers-reduced-motion stops it outright, leaving a
 * readable static row.
 */
export function TechMarquee() {
  if (tech.length === 0) return null;

  return (
    <section className="marquee-section" aria-label="Technologies we work with">
      <div className="marquee" data-marquee>
        {/* The copy is aria-hidden so the list is announced once, not twice. */}
        {[false, true].map((clone) => (
          <ul className="marquee-track" key={String(clone)} aria-hidden={clone || undefined}>
            {tech.map((item) => (
              <li key={item.name} className="marquee-item">
                {item.logo ? (
                  <Image src={item.logo} alt={item.name} width={120} height={32} className="marquee-logo" />
                ) : (
                  <span className="marquee-word">{item.name}</span>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

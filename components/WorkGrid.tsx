"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Platform, ProjectType } from "@/lib/content/schema";

/** Only the fields the grid renders, so MDX bodies never reach the client. */
export type WorkCard = {
  slug: string;
  title: string;
  summary: string;
  result?: string;
  platforms: Platform[];
  type?: ProjectType;
  thumbnail: { src: string; alt: string; width: number; height: number };
};

const ALL = "All";

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T | typeof ALL;
  onChange: (v: T | typeof ALL) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="mono text-muted">{label}</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {([ALL, ...options] as (T | typeof ALL)[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`filter-chip${value === option ? " is-on" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WorkGrid({
  cards,
  platforms,
  types,
}: {
  cards: WorkCard[];
  platforms: Platform[];
  types: ProjectType[];
}) {
  const [platform, setPlatform] = useState<Platform | typeof ALL>(ALL);
  const [type, setType] = useState<ProjectType | typeof ALL>(ALL);
  const gridRef = useRef<HTMLUListElement>(null);

  const shown = useMemo(
    () =>
      cards.filter(
        (p) =>
          (platform === ALL || p.platforms.includes(platform)) &&
          (type === ALL || p.type === type),
      ),
    [cards, platform, type],
  );

  // Cards are replaced when a filter changes, so the 3D tilt is re-bound to
  // whatever is on screen now.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/animations").then((m) => {
      if (!cancelled && gridRef.current) cleanup = m.bindTilt(gridRef.current);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [shown]);

  return (
    <>
      <div className="mb-12 flex flex-col gap-5 border-y border-line py-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
          <FilterGroup label="Platform" options={platforms} value={platform} onChange={setPlatform} />
          {/* Hidden until at least one project has a type set. */}
          {types.length > 0 ? (
            <FilterGroup label="Type" options={types} value={type} onChange={setType} />
          ) : null}
        </div>
        <p className="mono text-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="lede">No projects match that combination.</p>
      ) : (
        <ul ref={gridRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <article className="tilt h-full" data-tilt>
                <div className="tilt-inner flex h-full flex-col gap-6 p-5 md:p-6" data-tilt-inner>
                  <div className="shot tilt-pop-sm">
                    <Image
                      src={p.thumbnail.src}
                      alt={p.thumbnail.alt}
                      width={p.thumbnail.width}
                      height={p.thumbnail.height}
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                      className="tilt-pop"
                    />
                  </div>
                  <div className="tilt-pop-sm flex flex-1 flex-col">
                    <span className="mono text-accent">{p.platforms.join(" & ")}</span>
                    <h2 className="display mt-3 text-2xl md:text-3xl">
                      {/* Whole card is clickable; the link keeps the accessible name. */}
                      <Link href={`/work/${p.slug}`} className="card-link">
                        {p.title}
                      </Link>
                    </h2>
                    {/* `result` is the one-line outcome; falls back to the summary. */}
                    <p className="mt-3 text-muted">{p.result ?? p.summary}</p>
                    <span className="mono mt-auto inline-flex items-center gap-2 pt-6 text-text">
                      Case study <span aria-hidden="true">→</span>
                    </span>
                  </div>
                  <span className="tilt-glare" data-tilt-glare aria-hidden="true" />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

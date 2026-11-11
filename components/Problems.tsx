import { problems, problemsSection } from "@/content/problems";

/** "Why teams come to us" — the situation, and the short answer. */
export function Problems() {
  return (
    <section className="relative py-28 md:py-36" aria-labelledby="problems-title">
      <div className="shell">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow mb-6">{problemsSection.eyebrow}</p>
          <h2 id="problems-title" className="display h-section">
            {problemsSection.title}
          </h2>
          <p className="lede mt-6">{problemsSection.intro}</p>
        </div>

        <ul className="mt-14 grid gap-5 md:mt-20 md:grid-cols-2">
          {problems.map((item) => (
            <li key={item.problem} className="problem-card" data-reveal data-problem>
              <p className="problem-quote">&ldquo;{item.problem}&rdquo;</p>
              <p className="mt-5 text-muted">{item.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

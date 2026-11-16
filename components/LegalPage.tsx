import { PageShell } from "./PageShell";
import { site } from "@/content/site";
import type { LegalDoc } from "@/content/legal";

/**
 * Privacy and terms share a layout, and a format: blank lines separate
 * paragraphs, and a line beginning "## " is a heading. That is all of it.
 *
 * An unwritten document says so and gives a real address, rather than showing
 * boilerplate nobody has agreed to.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const blocks = doc.body.trim() ? doc.body.trim().split(/\n\s*\n/) : [];

  return (
    <PageShell>
      <section className="relative pb-28 pt-36 md:pb-44 md:pt-48">
        <div className="shell max-w-3xl">
          <h1 className="display h-section">{doc.title}</h1>
          {doc.updated ? <p className="mono mt-6 text-muted">Last updated {doc.updated}</p> : null}

          <div className="prose-case mt-10">
            {blocks.length > 0 ? (
              blocks.map((block, i) =>
                block.startsWith("## ") ? (
                  <h2 key={i} className="display mt-12 mb-4 text-2xl md:text-3xl">
                    {block.slice(3)}
                  </h2>
                ) : (
                  <p key={i}>{block}</p>
                ),
              )
            ) : (
              <p>
                We have not published this yet. For any question about it, email{" "}
                <a href={site.contact.emailHref}>{site.contact.email}</a>.
              </p>
            )}

            {/* Hidden until Novix sets the jurisdiction in content/legal.ts. */}
            {doc.governingLaw ? (
              <>
                <h2 className="display mt-12 mb-4 text-2xl md:text-3xl">Governing law</h2>
                <p>These terms are governed by {doc.governingLaw}.</p>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

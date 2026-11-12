import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { legal } from "@/content/legal";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `${legal.privacy.title} — ${site.name}`,
  description: `Privacy policy for ${site.url}.`,
  alternates: { canonical: "/privacy" },
  // Nothing to index until the policy is written.
  robots: legal.privacy.body ? { index: true, follow: true } : { index: false, follow: true },
};

export default function PrivacyPage() {
  const { title, updated, body } = legal.privacy;
  const paragraphs = body.trim() ? body.trim().split(/\n\s*\n/) : [];

  return (
    <PageShell>
      <section className="relative pb-28 pt-36 md:pb-44 md:pt-48">
        <div className="shell max-w-3xl">
          <h1 className="display h-section">{title}</h1>
          {updated ? <p className="mono mt-6 text-muted">Last updated {updated}</p> : null}

          <div className="prose-case mt-10">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              // No invented policy text: say plainly that it is not published
              // yet and give a real address to ask on.
              <p>
                We have not published this policy yet. For any question about how we handle your
                data, email{" "}
                <a href={site.contact.emailHref}>{site.contact.email}</a>.
              </p>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

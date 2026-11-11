import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { WorkGrid, type WorkCard } from "@/components/WorkGrid";
import { getProjects, usedPlatforms, usedTypes } from "@/lib/content/projects";
import { site } from "@/content/site";

const title = "Work — projects we have built and rescued";
const description =
  "Mobile and web projects by Novix Solutions, with the platform, the problem and what we shipped for each one.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/work" });

export default function WorkPage() {
  // Trimmed to what the grid renders; the MDX body stays on the server.
  const cards: WorkCard[] = getProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    result: p.result,
    platforms: p.platforms,
    type: p.type,
    thumbnail: p.thumbnail,
  }));

  return (
    <PageShell>
      <section className="relative pb-28 pt-36 md:pb-44 md:pt-48" aria-labelledby="work-title">
        <div className="shell">
          <div className="mb-14 max-w-4xl" data-reveal>
            <p className="eyebrow mb-6">{site.workSection.eyebrow}</p>
            <h1 id="work-title" className="display h-section">
              Projects we have built and rescued.
            </h1>
            <p className="lede mt-6">
              Every project below is live work. Open one to see the problem, what we built and the
              stack behind it.
            </p>
          </div>

          <WorkGrid cards={cards} platforms={usedPlatforms()} types={usedTypes()} />
        </div>
      </section>
    </PageShell>
  );
}

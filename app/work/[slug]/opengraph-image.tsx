import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { getProject, getProjectSlugs } from "@/lib/content/projects";

export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** One image per project, prerendered at build time alongside the page. */
export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export default async function CaseStudyOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  const title = project?.title ?? site.name;
  const summary = project?.summary ?? site.seo.description;
  const tags = project ? [...project.platforms, ...(project.type ? [project.type] : [])] : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0f14",
          backgroundImage: "radial-gradient(rgba(244,246,248,0.16) 2px, transparent 2px)",
          backgroundSize: "44px 44px",
          color: "#f4f6f8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, letterSpacing: 6 }}>
          <div style={{ width: 16, height: 16, background: "#3df57a", marginRight: 16 }} />
          {site.name.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 32,
              lineHeight: 1.3,
              color: "#94a1af",
              maxWidth: 950,
            }}
          >
            {summary}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Platform and type chips, omitted entirely when there are none. */}
          <div style={{ display: "flex", gap: 12 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  border: "1px solid rgba(244,246,248,0.25)",
                  borderRadius: 999,
                  fontSize: 26,
                  color: "#f4f6f8",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#3df57a" }}>
            {site.url.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

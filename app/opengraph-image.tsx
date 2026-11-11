import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.seo.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build time from the hero headline in content/site.ts.
export default function OpengraphImage() {
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
          background: "#090a08",
          backgroundImage: "radial-gradient(rgba(242,237,228,0.16) 2px, transparent 2px)",
          backgroundSize: "44px 44px",
          color: "#f2ede4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, letterSpacing: 6 }}>
          <div style={{ width: 18, height: 18, background: "#c9ff3b", marginRight: 18 }} />
          {site.name.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: -3,
            maxWidth: 1000,
          }}
        >
          {site.hero.headline}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#c9ff3b" }}>
          {site.url.replace("https://", "")}
        </div>
      </div>
    ),
    size,
  );
}

import type { NextConfig } from "next";

// The previous site was multi-page. These keep old links and search results
// working by sending each retired page to its section on the single page.
const retired: Record<string, string> = {
  services: "/#services",
  work: "/#work",
  about: "/#process",
  contact: "/#contact",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return Object.entries(retired).flatMap(([page, destination]) => [
      { source: `/${page}`, destination, permanent: true },
      { source: `/${page}.html`, destination, permanent: true },
    ]);
  },
};

export default nextConfig;

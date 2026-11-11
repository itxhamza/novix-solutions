import type { Metadata } from "next";

/**
 * Metadata for a standard page.
 *
 * Declaring an `openGraph` block on a page replaces the image inherited from
 * app/opengraph-image.tsx, so the site image is attached explicitly here. Case
 * studies do not use this helper — they generate their own image.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/work". Resolved against metadataBase. */
  path: string;
}): Metadata {
  const images = ["/opengraph-image"];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

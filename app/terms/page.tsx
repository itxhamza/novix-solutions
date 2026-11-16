import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/content/legal";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const doc = legal.terms;

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${doc.title} — ${site.name}`,
    description: `The terms covering your use of ${site.url.replace("https://", "")}. Client work is governed by its own written agreement.`,
    path: "/terms",
  }),
  robots: doc.body.trim() ? { index: true, follow: true } : { index: false, follow: true },
};

export default function TermsPage() {
  return <LegalPage doc={doc} />;
}

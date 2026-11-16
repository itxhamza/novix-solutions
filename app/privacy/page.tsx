import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/content/legal";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const doc = legal.privacy;

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${doc.title} — ${site.name}`,
    description: `How ${site.name} handles the information you give us. No analytics, no cookies, and nothing kept beyond your enquiry.`,
    path: "/privacy",
  }),
  // Nothing to index until the policy is written.
  robots: doc.body.trim() ? { index: true, follow: true } : { index: false, follow: true },
};

export default function PrivacyPage() {
  return <LegalPage doc={doc} />;
}

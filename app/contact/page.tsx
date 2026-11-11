import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { Contact } from "@/components/Contact";

const title = "Contact — tell us what's broken, or what's next";
const description =
  "Send Novix Solutions a few lines about your app. WhatsApp +92 305 4668401, info@novixsolutions.com, or the form. We reply within one business day.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/contact" });

export default function ContactPage() {
  return (
    <PageShell>
      <div className="pt-24 md:pt-32">
        <Contact heading="h1" />
      </div>
    </PageShell>
  );
}

import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/Hero";
import { TechMarquee } from "@/components/TechMarquee";
import { Services } from "@/components/Services";
import { Problems } from "@/components/Problems";
import { Process } from "@/components/Process";
import { FeaturedCase } from "@/components/FeaturedCase";
import { Stats } from "@/components/Stats";
import { Work } from "@/components/Work";
import { Testimonials } from "@/components/Testimonials";
import { Weekly } from "@/components/Weekly";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { approvedTestimonials } from "@/content/testimonials";
import { faqs } from "@/content/faq";
import { site } from "@/content/site";

/** FAQ rich result, built from the same content the accordion renders. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${site.url}/#faq`,
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function Page() {
  return (
    <PageShell withLoader>
      <Hero />
      <TechMarquee />
      <Services />
      <Problems />
      <Process />
      <FeaturedCase />
      <Stats />
      <Work />
      {/* Nothing renders unless an entry is approved in content/testimonials.ts. */}
      {approvedTestimonials.length > 0 ? <Testimonials items={approvedTestimonials} /> : null}
      <Weekly />
      <Faq />
      <FinalCta />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </PageShell>
  );
}

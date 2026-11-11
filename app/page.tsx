import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { Work } from "@/components/Work";
import { HomeCta } from "@/components/HomeCta";

export default function Page() {
  return (
    <PageShell withLoader>
      <Hero />
      <Services />
      <Process />
      <Work />
      <HomeCta />
    </PageShell>
  );
}

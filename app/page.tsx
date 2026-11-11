import { Loader } from "@/components/Loader";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { Work } from "@/components/Work";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { site } from "@/content/site";

export default function Page() {
  return (
    <>
      <Loader />
      {/* Live dot field (canvas) and custom cursor — both driven by lib/animations.ts */}
      <canvas className="field" data-field aria-hidden="true" />
      <div className="cursor" data-cursor aria-hidden="true">
        <div className="cursor__ring" data-cursor-ring>
          <span className="cursor__label" data-cursor-label>
            {site.cursorLabel}
          </span>
        </div>
      </div>

      <Header />
      <main className="relative z-10">
        <Hero />
        <Services />
        <Process />
        <Work />
        <Contact />
      </main>
      <Footer />
      <Motion />
    </>
  );
}

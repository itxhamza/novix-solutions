import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PageShell>
      <section className="relative grid min-h-[70vh] place-items-center pb-28 pt-36 md:pt-48">
        <div className="shell text-center">
          <p className="eyebrow mb-6 justify-center">404</p>
          <h1 className="display h-section">This page does not exist.</h1>
          <p className="lede mx-auto mt-6">
            The link may be out of date. The work, services and contact pages are all still here.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/work" className="btn btn-primary">
              View work <span aria-hidden="true">→</span>
            </Link>
            <Link href="/" className="btn btn-ghost">
              Home
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

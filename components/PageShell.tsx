import { Loader } from "./Loader";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Motion } from "./Motion";
import { site } from "@/content/site";

/**
 * Everything that wraps a page: the live dot field, the custom cursor, header,
 * footer and the animation bootstrap.
 *
 * lib/animations.ts is defensive about missing elements, so a page without a
 * hero or service panels simply gets fewer animations — reveals and the field
 * still work.
 *
 * `withLoader` is only for the home page; sub-pages should not replay the
 * wordmark draw on every navigation.
 */
export function PageShell({
  children,
  withLoader = false,
}: {
  children: React.ReactNode;
  withLoader?: boolean;
}) {
  return (
    <>
      {withLoader ? <Loader /> : null}
      <canvas className="field" data-field aria-hidden="true" />
      <div className="cursor" data-cursor aria-hidden="true">
        <div className="cursor__ring" data-cursor-ring>
          <span className="cursor__label" data-cursor-label>
            {site.cursorLabel}
          </span>
        </div>
      </div>

      <Header />
      <main className="relative z-10">{children}</main>
      <Footer />
      <Motion />
    </>
  );
}

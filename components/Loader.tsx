import { site } from "@/content/site";

/** Full-screen loader: the NOVIX wordmark drawn as one stroke. */
export function Loader() {
  return (
    <>
      <div className="loader" data-loader aria-hidden="true">
        <svg viewBox="-4 -4 268 68" role="presentation">
          <title>{site.shortName}</title>
          {/* N · O · V · I · X as a single path, drawn in one pass */}
          <path
            data-loader-path
            pathLength={1}
            d="M0 60V0L44 60V0 M66 0H110V60H66Z M132 0L156 60L180 0 M202 0V60 M224 0L260 60 M260 0L224 60"
          />
        </svg>
      </div>
      <noscript>
        <style>{`.loader{display:none}`}</style>
      </noscript>
    </>
  );
}

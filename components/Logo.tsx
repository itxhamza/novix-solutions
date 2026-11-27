/**
 * The logotype, inline rather than an <img>, so the strokes can draw
 * themselves on first load (initLogo in lib/animations.ts).
 *
 * Geometry is copied verbatim from public/brand/novix-logotype-dark.svg — the
 * file is still the source of truth for the brand, and this must not drift
 * from it. Every stroke carries pathLength={1} so one dash length covers the
 * whole path whatever its real length, which is what lets a single tween draw
 * letters of wildly different sizes at the same rate.
 *
 * `draw` is set on the header only. Without it the logo is simply static, and
 * CSS leaves every stroke fully drawn unless the `.anim` class is present, so
 * reduced motion and a failed script both show a finished logo.
 */
export function Logo({ className, draw = false }: { className?: string; draw?: boolean }) {
  const mark = { strokeWidth: 44, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const word = { strokeWidth: 30, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  // Themed, not fixed: the ink half follows the text colour, and the green
  // deepens on a light ground where the vivid brand green goes pale. Both
  // are declared in app/globals.css.
  const INK = "var(--logo-ink)";
  const ACCENT = "var(--logo-green)";

  return (
    <svg
      viewBox="0 0 963 311"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-logo={draw ? "" : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <g transform="translate(47.01 24) skewX(-5) translate(0 -25)">
        <g transform="translate(0 25) scale(1.7533) translate(0 -25)">
          <path d="M22 153V47" stroke={INK} pathLength={1} data-logo-mark {...mark} />
          <path d="M134 47V153" stroke={ACCENT} pathLength={1} data-logo-mark {...mark} />
          <path d="M22 47L134 153" stroke={INK} pathLength={1} data-logo-mark {...mark} />
        </g>

        <circle
          cx="384.52000000000004"
          cy="100"
          r="53"
          stroke={INK}
          strokeWidth={44}
          pathLength={1}
          data-logo-mark
        />
        <path
          d="M511.52000000000004 47L566.52 153L621.52 47"
          stroke={INK}
          pathLength={1}
          data-logo-mark
          {...mark}
        />
        <path d="M695.52 47V153" stroke={INK} pathLength={1} data-logo-mark {...mark} />
        <path d="M769.52 153L869.52 47" stroke={ACCENT} pathLength={1} data-logo-mark {...mark} />
        <path d="M769.52 47L869.52 153" stroke={INK} pathLength={1} data-logo-mark {...mark} />

        <g transform="translate(309.52000000000004 0)">
          <g transform="translate(0 206) scale(0.38) translate(0 -25)">
            <path
              d="M78 47H41.5A26.5 26.5 0 0 0 41.5 100H61.5A26.5 26.5 0 0 1 61.5 153H25"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M240.19736842105263 47A42 42 0 0 1 282.1973684210526 89V111A42 42 0 0 1 198.19736842105263 111V89A42 42 0 0 1 240.19736842105263 47Z"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M392.39473684210526 47V153H454.39473684210526"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M564.5921052631579 47V113A40 40 0 0 0 644.5921052631579 113V47"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M754.7894736842105 47H838.7894736842105M796.7894736842105 47V153"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M948.9868421052631 47V153"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M1101.1842105263158 47A42 42 0 0 1 1143.1842105263158 89V111A42 42 0 0 1 1059.1842105263158 111V89A42 42 0 0 1 1101.1842105263158 47Z"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M1253.3815789473686 153V47L1333.3815789473686 153V47"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
            <path
              d="M1506.5789473684213 47H1470.0789473684213A26.5 26.5 0 0 0 1470.0789473684213 100H1490.0789473684213A26.5 26.5 0 0 1 1490.0789473684213 153H1453.5789473684213"
              stroke={ACCENT}
              pathLength={1}
              data-logo-word
              {...word}
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

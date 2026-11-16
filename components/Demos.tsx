/**
 * Micro-demos for the three service panels. Each SVG is drawn in its finished
 * state; lib/animations.ts loops it (and leaves it as-is for reduced motion).
 */
import { getService } from "@/content/services";

const PHONE = { x: 100, y: 20, w: 200, h: 400, r: 30 };

/** 1 — a phone that assembles itself from loose pieces. */
export function BuildDemo() {
  return (
    <svg viewBox="0 0 400 440" data-demo="build" aria-hidden="true">
      <g fill="none" stroke="var(--color-text)" strokeWidth="2">
        <rect data-piece x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx={PHONE.r} />
      </g>
      <rect data-piece x="170" y="34" width="60" height="12" rx="6" fill="var(--color-text)" />
      <rect data-piece x="120" y="66" width="90" height="10" rx="5" fill="var(--color-muted)" />
      <circle data-piece cx="266" cy="71" r="10" fill="none" stroke="var(--color-muted)" strokeWidth="2" />
      <rect
        data-piece
        x="120"
        y="96"
        width="160"
        height="96"
        rx="14"
        fill="var(--color-raised)"
        stroke="var(--color-line)"
      />
      <rect data-piece x="120" y="206" width="74" height="64" rx="12" fill="var(--color-raised)" />
      <rect data-piece x="206" y="206" width="74" height="64" rx="12" fill="var(--color-raised)" />
      <rect data-piece x="120" y="286" width="160" height="8" rx="4" fill="var(--color-line)" />
      <rect data-piece x="120" y="304" width="110" height="8" rx="4" fill="var(--color-line)" />
      <rect data-piece data-build-cta x="120" y="332" width="160" height="38" rx="19" fill="var(--color-accent)" />
      <rect data-piece x="165" y="396" width="70" height="5" rx="2.5" fill="var(--color-muted)" />
      {/* "shipped" badge that pops once the build is complete */}
      <g data-build-badge>
        <circle cx="300" cy="40" r="22" fill="var(--color-accent)" />
        <path
          d="M290 40l7 7 13-14"
          fill="none"
          stroke="var(--color-accent-ink)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

const ROWS = [108, 168, 228, 288];

/** 2 — a phone full of error bars that get fixed one by one. */
export function RescueDemo({ broken, fixed }: { broken: string; fixed: string }) {
  return (
    <svg viewBox="0 0 400 440" data-demo="rescue" aria-hidden="true">
      <rect
        data-rescue-frame
        x={PHONE.x}
        y={PHONE.y}
        width={PHONE.w}
        height={PHONE.h}
        rx={PHONE.r}
        fill="none"
        stroke="var(--color-text)"
        strokeWidth="2"
      />
      <rect x="170" y="34" width="60" height="12" rx="6" fill="var(--color-text)" />
      <text
        data-rescue-status
        data-broken={broken}
        data-fixed={fixed}
        x="200"
        y="84"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        letterSpacing="1.5"
        fill="var(--color-accent)"
      >
        {fixed.toUpperCase()}
      </text>
      {ROWS.map((y) => (
        <g key={y} data-rescue-row>
          <rect
            data-rescue-bar
            x="120"
            y={y}
            width="160"
            height="44"
            rx="12"
            fill="var(--color-raised)"
            stroke="var(--color-line)"
          />
          <rect data-rescue-line x="166" y={y + 14} width="92" height="6" rx="3" fill="var(--color-muted)" />
          <rect x="166" y={y + 26} width="56" height="5" rx="2.5" fill="var(--color-line)" />
          <circle data-rescue-dot cx="143" cy={y + 22} r="11" fill="var(--color-accent)" />
          <path
            data-rescue-ok
            d={`M138 ${y + 22}l4 4 7-8`}
            fill="none"
            stroke="var(--color-accent-ink)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            data-rescue-bad
            d={`M143 ${y + 16}v7 M143 ${y + 27.5}v.5`}
            fill="none"
            stroke="var(--color-bg)"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0"
          />
        </g>
      ))}
      {/* scanner that sweeps down as each row is repaired */}
      <rect data-rescue-scan x="108" y="100" width="184" height="2" fill="var(--color-accent)" opacity="0" />
      <rect x="165" y="396" width="70" height="5" rx="2.5" fill="var(--color-muted)" />
    </svg>
  );
}

/** 3 — what the app already knows feeds a model, which answers with something made for that person. */
export function AiDemo() {
  const rows = [72, 108, 144];
  const wires = [
    "M150 98C150 150 200 150 200 200",
    "M200 134V200",
    "M250 170C250 186 200 182 200 200",
  ];

  return (
    <svg viewBox="0 0 400 440" data-demo="ai" aria-hidden="true">
      <rect
        x={PHONE.x}
        y={PHONE.y}
        width={PHONE.w}
        height={PHONE.h}
        rx={PHONE.r}
        fill="none"
        stroke="var(--color-text)"
        strokeWidth="2"
      />
      <rect x="170" y="34" width="60" height="12" rx="6" fill="var(--color-text)" />

      {/* what the product already knows about this person */}
      {rows.map((y, i) => (
        <g key={y} data-ai-signal>
          <rect x="120" y={y} width="160" height="26" rx="9" fill="var(--color-raised)" stroke="var(--color-line)" />
          <circle cx="136" cy={y + 13} r="4" fill="var(--color-accent)" />
          <rect x="150" y={y + 9} width={104 - i * 24} height="8" rx="4" fill="var(--color-muted)" />
        </g>
      ))}

      {/* …travelling into the model */}
      {wires.map((d) => (
        <path
          key={d}
          data-ai-wire
          d={d}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
        />
      ))}

      <circle data-ai-halo cx="200" cy="226" r="30" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0" />
      <circle
        data-ai-ring
        cx="200"
        cy="226"
        r="38"
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        strokeDasharray="5 9"
      />
      <g data-ai-core>
        <circle cx="200" cy="226" r="22" fill="var(--color-accent)" />
        <path
          d="M200 214l3.6 8.4 8.4 3.6-8.4 3.6-3.6 8.4-3.6-8.4-8.4-3.6 8.4-3.6z"
          fill="var(--color-accent-ink)"
        />
      </g>

      {/* …and coming back out as the next thing to do */}
      <g data-ai-card>
        <rect x="120" y="288" width="160" height="92" rx="14" fill="var(--color-raised)" stroke="var(--color-line)" />
        <rect data-ai-bit x="136" y="304" width="44" height="8" rx="4" fill="var(--color-accent)" />
        <rect data-ai-bit x="136" y="324" width="128" height="8" rx="4" fill="var(--color-muted)" />
        <rect data-ai-bit x="136" y="342" width="96" height="8" rx="4" fill="var(--color-line)" />
        <rect data-ai-bit x="136" y="360" width="64" height="4" rx="2" fill="var(--color-line)" />
      </g>

      <rect x="165" y="396" width="70" height="5" rx="2.5" fill="var(--color-muted)" />
    </svg>
  );
}

/**
 * Whether a service has the content its demo needs. Used by the panel layout:
 * a panel with no demo drops the demo column instead of leaving it empty.
 */
export function hasServiceDemo(id: string): boolean {
  if (id === "build" || id === "ai") return true;
  if (id !== "rescue") return false;
  const rescue = getService("rescue");
  return Boolean(rescue?.demoBroken && rescue.demoFixed);
}

/** The rescue demo needs its labels from content/services.ts; without them it is hidden. */
export function ServiceDemo({ id }: { id: string }) {
  if (id === "build") return <BuildDemo />;
  if (id === "ai") return <AiDemo />;
  if (id !== "rescue") return null;

  const rescue = getService("rescue");
  if (!rescue?.demoBroken || !rescue.demoFixed) return null;
  return <RescueDemo broken={rescue.demoBroken} fixed={rescue.demoFixed} />;
}

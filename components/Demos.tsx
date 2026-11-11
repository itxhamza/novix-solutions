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

// Dot-matrix world, North America → South Asia (generated from Natural Earth land data).
const WORLD = [
  "#####..#...##.#.#.##....######...............########.#.#######.######",
  "#############.#.####....####.....###........###.###.##################",
  "###########.....##.......##...............####.#######################",
  "###########.....###.#.....................#.##..######################",
  "###############.######.................#...#...#######################",
  ".##############.#######..............#.##.############################",
  ".###################..##...............###############################",
  "..####################..................##########..###..#############",
  "..################....................###...#.###....###.#############",
  "..###############.....................##...#.#.#.#######.#############",
  "...##############........................###........##################",
  "....############......................#######......###################",
  "....#######.#.#......................#################################",
  ".....#####..........................###############.####..############",
  ".......###.........................#################.######...########",
  "........##..#...#..................#################.######....####...",
  ".........####......................##################.###......###....",
  "............##.....................####################.........##....",
  ".................####...............####################........#.....",
  "................######...............###################.........#....",
];
const DOTS = WORLD.flatMap((row, r) =>
  [...row].flatMap((c, i) => (c === "#" ? [`M${i * 10 + 5} ${r * 10 + 5}h.01`] : [])),
).join("");

const US = { x: 174, y: 90 };
const PK = { x: 637, y: 119 };

function Avatar({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g data-team-avatar={id}>
      <circle data-team-ring cx={x} cy={y} r="20" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.5" />
      <circle cx={x} cy={y} r="15" fill="var(--color-accent)" />
      <circle cx={x} cy={y - 4} r="4.6" fill="var(--color-accent-ink)" />
      <path
        d={`M${x - 8.5} ${y + 10}a8.5 7.5 0 0 1 17 0`}
        fill="var(--color-accent-ink)"
      />
    </g>
  );
}

/** 3 — two people connected by a glowing line across a US ↔ Pakistan map. */
export function TeamDemo({ from, to }: { from: { label: string; time: string }; to: { label: string; time: string } }) {
  const arc = `M${US.x} ${US.y}Q405 -70 ${PK.x} ${PK.y}`;
  return (
    <div className="flex w-full flex-col gap-5" data-demo="team" aria-hidden="true">
      <svg viewBox="0 -30 700 240" className="!h-auto !max-h-none">
        <path d={DOTS} stroke="var(--color-muted)" strokeOpacity="0.55" strokeWidth="3.4" strokeLinecap="round" />
        <path d={arc} data-team-glow fill="none" stroke="var(--color-accent)" strokeOpacity="0.22" strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray="1" />
        <path d={arc} data-team-arc fill="none" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" pathLength={1} strokeDasharray="1" />
        <circle data-team-packet r="5" cx={PK.x} cy={PK.y} fill="var(--color-text)" opacity="0" />
        <Avatar {...US} id="from" />
        <Avatar {...PK} id="to" />
      </svg>
      <div className="flex items-start justify-between gap-4 text-sm">
        {[from, to].map((p, i) => (
          <div key={p.label} data-team-label className={i === 1 ? "text-right" : ""}>
            <div className="font-semibold text-text">{p.label}</div>
            <div className="mono text-muted">{p.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Whether a service has the content its demo needs. Used by the panel layout:
 * a panel with no demo drops the demo column instead of leaving it empty.
 */
export function hasServiceDemo(id: string): boolean {
  if (id === "build") return true;
  if (id === "rescue") {
    const rescue = getService("rescue");
    return Boolean(rescue?.demoBroken && rescue.demoFixed);
  }
  const team = getService("team");
  return Boolean(team?.demoFrom && team.demoTo);
}

/** Each demo needs its labels from content/services.ts; without them it is hidden. */
export function ServiceDemo({ id }: { id: string }) {
  if (id === "build") return <BuildDemo />;

  if (id === "rescue") {
    const rescue = getService("rescue");
    if (!rescue?.demoBroken || !rescue.demoFixed) return null;
    return <RescueDemo broken={rescue.demoBroken} fixed={rescue.demoFixed} />;
  }

  const team = getService("team");
  if (!team?.demoFrom || !team.demoTo) return null;
  return <TeamDemo from={team.demoFrom} to={team.demoTo} />;
}

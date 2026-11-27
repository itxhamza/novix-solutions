import { DeviceFrame } from "./DeviceFrame";
import { getProject } from "@/lib/content/projects";

/**
 * Three real products in the hero, one device frame each.
 *
 * Not one frame cross-fading between projects: Bynaus.ai is a web product with
 * no phone screens, and cycling it through a phone would misrepresent what we
 * built. Three frames also show all three at once instead of two thirds of the
 * time. Phone frames for the mobile products and a browser frame for the web
 * one makes the "mobile and web apps" line something you see rather than read.
 *
 * Every screen below is a real screenshot already in /public/work, used on that
 * project's own case study. A project that loses its screenshot drops out of
 * the stack rather than leaving a hole.
 */
const SHOTS = [
  {
    slug: "bynaus-ai",
    src: "/work/bynaus-ai/dashboard.webp",
    alt: "The Bynaus.ai dashboard",
    width: 1600,
    height: 896,
    frame: "browser",
    depth: "back",
    sizes: "(min-width: 1024px) 34vw, 1px",
    // The widest thing in the hero, so this is the LCP element on desktop.
    priority: true,
  },
  {
    slug: "blackjack-wiz",
    src: "/work/blackjack-wiz/training.webp",
    alt: "The Blackjack Wiz training home",
    width: 750,
    height: 1950,
    frame: "phone",
    depth: "mid",
    sizes: "(min-width: 1024px) 10vw, 1px",
    priority: false,
  },
  {
    slug: "runout",
    src: "/work/runout/app-home.webp",
    alt: "The Runout app home",
    width: 750,
    height: 2358,
    frame: "phone",
    depth: "front",
    sizes: "(min-width: 1024px) 10vw, 1px",
    priority: false,
  },
] as const;

export function HeroStack() {
  const shots = SHOTS.filter((s) => getProject(s.slug));
  if (shots.length === 0) return null;

  return (
    <div className="hero-stack" data-hero-stack>
      {shots.map((shot) => (
        <div
          key={shot.slug}
          className={`hero-device hero-device-${shot.depth}`}
          data-hero-device
          data-depth={shot.depth}
        >
          <DeviceFrame
            shot={{
              src: shot.src,
              alt: shot.alt,
              width: shot.width,
              height: shot.height,
              frame: shot.frame,
            }}
            sizes={shot.sizes}
            priority={shot.priority}
          />
        </div>
      ))}
    </div>
  );
}

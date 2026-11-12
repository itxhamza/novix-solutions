import Image from "next/image";

export type Shot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  frame: "phone" | "browser";
};

/**
 * Wraps a screenshot in a phone or browser chrome.
 *
 * The frame takes its aspect ratio from the image's own dimensions, and the
 * image is `object-fit: contain`, so no UI is ever stretched or cropped.
 */
export function DeviceFrame({ shot, sizes, priority }: { shot: Shot; sizes?: string; priority?: boolean }) {
  const isPhone = shot.frame === "phone";

  return (
    <figure className={isPhone ? "frame frame-phone" : "frame frame-browser"}>
      {isPhone ? (
        <span className="frame-notch" aria-hidden="true" />
      ) : (
        <span className="frame-bar" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      <div className="frame-screen" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          sizes={sizes ?? "(min-width: 768px) 40vw, 90vw"}
          priority={priority}
        />
      </div>
    </figure>
  );
}

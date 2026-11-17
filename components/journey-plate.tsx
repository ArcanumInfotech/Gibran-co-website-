"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/components/smooth-scroll-provider";

const VIDEO_SRC = "/video/cake.mp4";

/**
 * The crossfaded clip is built to open on source frame 11 (frames 11..60
 * blended with 1..10), so this is the exact still the video's first frame
 * shows — the poster hands over to playback without a visible jump.
 */
const VIDEO_POSTER = "/Exquisite/ezgif-frame-011.jpg";

/** Warm ground behind the poster, and the reduced-motion end state. */
const FALLBACK =
  "linear-gradient(120deg, #1d241b 0%, #2b3329 45%, #4a3f2c 100%)";

/**
 * Looping background plate for the pinned journey section.
 *
 * The footage is a seamless 2.08s crossfade loop cut from public/cake.mp4
 * (see scripts/make-video.mjs), so it can cycle indefinitely with no visible
 * seam. It is decorative, hence muted + inline + no controls: that combination
 * is what browsers permit to autoplay without a user gesture.
 */
export function JourneyPlate({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Explicit DOM property assignment required for iOS Safari / Android Chrome autoplay
    video.muted = true;
    video.defaultMuted = true;

    if (reduced) {
      video.pause();
      return;
    }

    let cancelled = false;
    const playVideo = () => {
      const attempt = video.play();
      if (attempt) {
        attempt
          .then(() => {
            if (!cancelled) setPlaying(true);
          })
          .catch(() => {
            // Autoplay deferred by browser battery saver policy
          });
      } else {
        setPlaying(true);
      }
    };

    playVideo();

    // On mobile devices, ensure video plays immediately on user scroll or touch
    const handleInteraction = () => {
      if (video.paused) {
        playVideo();
      }
    };

    window.addEventListener("touchstart", handleInteraction, { passive: true, once: true });
    window.addEventListener("scroll", handleInteraction, { passive: true, once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, [reduced]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* Gradient ground behind poster */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: FALLBACK }}
      />

      <video
        ref={ref}
        src={VIDEO_SRC}
        poster={VIDEO_POSTER}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-[68%_center] lg:object-center transition-opacity duration-700 opacity-100"
      />
    </div>
  );
}

"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Photo } from "@/data";

const control =
  "flex items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40";

/**
 * One photo at a time, full width. Swipe or trackpad-scroll on the track
 * (native scroll-snap), or use the arrows and dots.
 */
export default function PhotoCarousel({
  photos,
  label,
  className = "",
}: {
  photos: Photo[];
  /** Names the carousel for screen readers, e.g. the stop's title. */
  label: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const many = photos.length > 1;

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (i + photos.length) % photos.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`Photos: ${label}`}
      className={`group relative overflow-hidden ${className}`}
    >
      <ul
        ref={trackRef}
        // Lenis would turn sideways trackpad swipes into page scroll; let them through.
        data-lenis-prevent-horizontal
        onScroll={(e) => {
          const t = e.currentTarget;
          setIndex(Math.round(t.scrollLeft / t.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <li
            key={photo.src}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${photos.length}`}
            className="w-full shrink-0 snap-center"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={896}
              height={672}
              sizes="(min-width: 768px) 448px, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </li>
        ))}
      </ul>

      {many && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => goTo(index - 1)}
            className={`${control} absolute top-1/2 left-2 size-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100`}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => goTo(index + 1)}
            className={`${control} absolute top-1/2 right-2 size-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100`}
          >
            <ChevronRight size={18} aria-hidden />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className="p-1 focus-visible:outline-2 focus-visible:outline-foreground/40"
              >
                <span
                  aria-hidden
                  className={`block size-1.5 rounded-full shadow shadow-black/50 transition-colors ${
                    i === index ? "bg-white" : "bg-white/45"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

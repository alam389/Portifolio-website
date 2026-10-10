"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { journey, type JourneyKind } from "@/data";
import JourneySteps from "./JourneySteps";
import PhotoCarousel from "./PhotoCarousel";
import { scrollToY } from "./SmoothScroll";
import { useReducedMotion } from "./useReducedMotion";
import { useStepKeys } from "./useStepKeys";

// three.js only loads on this page, and only in the browser.
const JourneyGlobe = dynamic(() => import("./JourneyGlobe"), { ssr: false });

const kindLabel: Record<JourneyKind, string> = {
  life: "Life",
  education: "Education",
  work: "Work",
  project: "Project",
  travel: "Travel",
  volunteering: "Volunteering",
};

export default function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const top = useRef(0);
  const sectionHeight = useRef(1);
  const reducedMotion = useReducedMotion();

  // Each section is one viewport tall, so progress is how many viewports
  // the reader has scrolled past the intro: 0 = first stop's card fills
  // the screen, -1 = intro, 1.5 = halfway between the second and third.
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      top.current = el.getBoundingClientRect().top + window.scrollY;
      sectionHeight.current =
        (el.firstElementChild as HTMLElement | null)?.offsetHeight ||
        window.innerHeight;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const getProgress = useCallback(
    () => (window.scrollY - top.current) / sectionHeight.current - 1,
    [],
  );

  // Where paging is headed: -1 = intro, 0..n-1 = stops, n = the footer below.
  // Follows the scroll position whenever no step is animating.
  const target = useRef(-1);
  const busyUntil = useRef(0);

  // The stop whose card is closest to filling the screen; -1 on the intro.
  const [active, setActive] = useState(-1);
  useEffect(() => {
    const update = () => {
      const p = getProgress();
      const i = p < -0.5 ? -1 : Math.min(journey.length - 1, Math.round(p));
      setActive(i);
      if (performance.now() > busyUntil.current) target.current = i;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [getProgress]);

  // Scroll so stop i's card fills the screen (i = n: the page's end). Longer
  // jumps take a little longer so the globe can fly the path in between
  // without whipping.
  const goTo = (i: number) => {
    const hops = Math.abs(i - Math.max(target.current, 0));
    const duration = Math.min(3, 1 + 0.25 * hops);
    const y =
      i >= journey.length
        ? document.documentElement.scrollHeight - window.innerHeight
        : top.current + sectionHeight.current * (i + 1);
    target.current = i;
    busyUntil.current = performance.now() + (reducedMotion ? 0 : duration * 1000);
    scrollToY(y, duration);
  };

  // Arrow and Page keys move one stop; pressing again mid-flight keeps going.
  useStepKeys((dir) => {
    const next = Math.max(-1, Math.min(journey.length, target.current + dir));
    if (next !== target.current) goTo(next);
  });

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
      >
        <JourneyGlobe
          stops={journey}
          getProgress={getProgress}
          reducedMotion={reducedMotion}
        />
      </div>

      <JourneySteps stops={journey} active={active} onSelect={goTo} />

      <div ref={containerRef} className="relative z-10">
        <section className="flex h-svh flex-col justify-center">
          <h1 className="text-3xl font-semibold tracking-tight">Journey</h1>
          <p className="mt-2 max-w-sm text-foreground/60">
            Where I&apos;ve been and what I was doing there. Scroll to follow
            the path.
          </p>
        </section>

        <ol>
          {journey.map((stop) => (
            <li
              key={stop.id}
              className="flex h-svh items-end pb-28 md:items-center md:pb-0"
            >
              <article
                className={`w-full overflow-hidden rounded-xl border border-foreground/10 bg-background/60 p-5 backdrop-blur-md ${
                  stop.photos || stop.embed ? "max-w-md" : "max-w-sm"
                }`}
              >
                {stop.photos && (
                  <PhotoCarousel
                    photos={stop.photos}
                    label={stop.title}
                    className="-mx-5 -mt-5 mb-4"
                  />
                )}
                {stop.logo && (
                  // Logos are dark marks; flip them to light on the dark theme.
                  <Image
                    src={stop.logo.src}
                    alt={stop.logo.alt}
                    width={99}
                    height={32}
                    className="mb-4 h-6 w-auto invert light:invert-0"
                  />
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-foreground/50">
                  <span>{stop.date}</span>
                  <span aria-hidden>·</span>
                  <span>{kindLabel[stop.kind]}</span>
                  {stop.now && (
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-background">
                      Now
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold">{stop.title}</h2>
                <p className="text-sm text-foreground/60">
                  {stop.place}
                  {stop.remote && " · Remote"}
                </p>
                {stop.description && (
                  <p className="mt-3 text-sm text-foreground/80">
                    {stop.description}
                  </p>
                )}
                {stop.embed && (
                  // LinkedIn's suggested 670px, capped so the card fits short screens.
                  <iframe
                    src={stop.embed.src}
                    title={stop.embed.title}
                    loading="lazy"
                    allowFullScreen
                    className="mt-3 h-[min(670px,55svh)] w-full rounded-md border border-foreground/10 bg-white"
                  />
                )}
                {stop.links && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {stop.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                )}
                {stop.draft && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-amber-300/90">
                    <span className="rounded border border-amber-300/40 px-1.5 font-mono uppercase">
                      Draft
                    </span>
                    <span>{stop.draft}</span>
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

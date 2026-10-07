"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { journey, type JourneyKind } from "@/data";

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
  const [reducedMotion, setReducedMotion] = useState(false);

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
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const getProgress = useCallback(
    () => (window.scrollY - top.current) / sectionHeight.current - 1,
    [],
  );

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
              className="flex h-svh items-end pb-8 md:items-center md:pb-0"
            >
              <article className="w-full max-w-sm rounded-xl border border-foreground/10 bg-background/60 p-5 backdrop-blur-md">
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

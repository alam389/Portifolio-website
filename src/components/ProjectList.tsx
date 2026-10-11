"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { projectStatusLabel, type Project, type ProjectTag } from "@/data";

// Only tags some project actually uses, most common first (ties keep the
// order they first appear in projects.ts).
function tagCounts(projects: Project[]) {
  const counts = new Map<ProjectTag, number>();
  for (const p of projects) {
    for (const tag of p.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

const chip =
  "rounded-full border px-3 py-1.5 text-sm pointer-coarse:py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40";
const chipIdle =
  "border-foreground/15 text-foreground/70 hover:border-foreground/30 hover:text-foreground";
const link =
  "-my-1 py-1 pointer-coarse:-my-2.5 pointer-coarse:py-2.5 underline decoration-foreground/30 underline-offset-4 transition-colors duration-150 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40";
const chipActive = "border-foreground/50 bg-foreground/10 text-foreground";

// Descriptions are clamped to three lines until expanded. The length is only
// a first guess for the server render; the ResizeObserver below measures
// whether the clamp actually cut anything at the current width.
const LONG_DESCRIPTION = 220;

function ProjectCard({
  project: p,
  filter,
  first,
}: {
  project: Project;
  filter: ProjectTag | null;
  first: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(p.description.length > LONG_DESCRIPTION);
  const description = useRef<HTMLParagraphElement>(null);

  // Measure only while clamped: once open the text is never cut, but the
  // toggle must stay so it can be closed again.
  useEffect(() => {
    const el = description.current;
    if (!el || open) return;
    const observer = new ResizeObserver(() =>
      setLong(el.scrollHeight > el.clientHeight + 1),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  return (
    <li className="overflow-hidden rounded-lg border border-foreground/10 p-5">
      {p.video ? (
        <video
          src={p.video.src}
          aria-label={p.video.label}
          controls
          playsInline
          preload="metadata"
          className="-mx-5 -mt-5 mb-5 aspect-video max-w-none border-b border-foreground/10 bg-surface object-contain"
          style={{ width: "calc(100% + 2.5rem)" }}
        />
      ) : (
        p.image && (
          <Image
            src={p.image.src}
            alt={p.image.alt}
            width={p.image.width ?? 1400}
            height={p.image.height ?? 711}
            sizes="(min-width: 768px) 700px, 100vw"
            priority={first}
            className="-mx-5 -mt-5 mb-5 aspect-video max-w-none border-b border-foreground/10 bg-surface object-contain"
            style={{ width: "calc(100% + 2.5rem)" }}
          />
        )
      )}
      <p className="font-mono text-xs text-foreground/60">
        {projectStatusLabel[p.status]}
        {p.period ? ` · ${p.period}` : ""}
      </p>
      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-2xl font-medium tracking-tight">{p.title}</h2>
        {(p.github || p.live) && (
          <div className="flex gap-5 text-sm">
            {p.github && (
              <a
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                GitHub <span aria-hidden>↗</span>
              </a>
            )}
            {p.live && (
              <a
                href={p.live}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                Live <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-foreground/60">{p.tagline}</p>
      <p
        ref={description}
        id={`${p.id}-description`}
        className={`mt-4 text-foreground/80 ${open ? "" : "line-clamp-3"}`}
      >
        {p.description}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${p.id}-description`}
          onClick={() => setOpen(!open)}
          className={`${link} mt-1 text-sm text-foreground/70`}
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
      <p className="mt-4 font-mono text-xs text-foreground/60">
        <span className="sr-only">Tags: </span>
        {p.tags.map((tag, i) => (
          <span key={tag}>
            {i > 0 && " · "}
            <span className={tag === filter ? "text-foreground" : undefined}>
              {tag}
            </span>
          </span>
        ))}
      </p>
      <p className="mt-1.5 font-mono text-xs text-foreground/60">
        <span className="sr-only">Technologies: </span>
        {p.technologies.join(" / ")}
      </p>
    </li>
  );
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tags = tagCounts(projects);
  // The filter lives in ?tag= so a filtered view can be linked; unknown
  // values fall back to "All".
  const requested = params.get("tag");
  const filter = tags.find(([tag]) => tag === requested)?.[0] ?? null;
  const setFilter = (tag: ProjectTag | null) =>
    router.replace(
      tag ? `${pathname}?tag=${encodeURIComponent(tag)}` : pathname,
      {
        scroll: false,
      },
    );
  const shown = filter
    ? projects.filter((p) => p.tags.includes(filter))
    : projects;

  return (
    <>
      <div
        role="group"
        aria-label="Filter projects by tag"
        className="mt-8 flex flex-wrap items-center gap-2"
      >
        <span aria-hidden className="mr-1 font-mono text-xs text-foreground/60">
          Filter
        </span>
        <button
          type="button"
          aria-pressed={filter === null}
          onClick={() => setFilter(null)}
          className={`${chip} ${filter === null ? chipActive : chipIdle}`}
        >
          All <span className="opacity-60">{projects.length}</span>
        </button>
        {tags.map(([tag, count]) => (
          <button
            key={tag}
            type="button"
            aria-pressed={filter === tag}
            // Clicking the active tag again clears the filter.
            onClick={() => setFilter(filter === tag ? null : tag)}
            className={`${chip} ${filter === tag ? chipActive : chipIdle}`}
          >
            {tag} <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {shown.length} of {projects.length} projects
      </p>

      <ul className="mt-6 grid gap-4">
        {shown.map((p, i) => (
          <ProjectCard key={p.id} project={p} filter={filter} first={i === 0} />
        ))}
      </ul>
    </>
  );
}

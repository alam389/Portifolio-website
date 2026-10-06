"use client";

import { useState } from "react";
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
  "rounded-full border px-3 py-1 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40";
const chipIdle =
  "border-foreground/15 text-foreground/70 hover:border-foreground/30 hover:text-foreground";
const chipActive = "border-foreground bg-foreground text-background";

export default function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ProjectTag | null>(null);
  const shown = filter
    ? projects.filter((p) => p.tags.includes(filter))
    : projects;

  return (
    <>
      <div role="group" aria-label="Filter projects by tag" className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filter === null}
          onClick={() => setFilter(null)}
          className={`${chip} ${filter === null ? chipActive : chipIdle}`}
        >
          All <span className="opacity-60">{projects.length}</span>
        </button>
        {tagCounts(projects).map(([tag, count]) => (
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
        {shown.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border border-foreground/10 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <span className="font-mono text-xs text-foreground/50">
                {projectStatusLabel[p.status]}
                {p.period ? ` · ${p.period}` : ""}
              </span>
            </div>
            <p className="text-sm text-foreground/60">{p.tagline}</p>
            <ul aria-label="Tags" className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <li
                  key={tag}
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${
                    tag === filter
                      ? "border-foreground/60 text-foreground"
                      : "border-foreground/15 text-foreground/70"
                  }`}
                >
                  {tag}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-foreground/80">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.technologies.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-foreground/5 px-2 py-1 font-mono text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
            {(p.github || p.live) && (
              <div className="mt-3 flex gap-4 text-sm">
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    GitHub ↗
                  </a>
                )}
                {p.live && (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    Live ↗
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

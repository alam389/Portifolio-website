import type { Metadata } from "next";
import { projects, type ProjectStatus } from "@/data";

export const metadata: Metadata = { title: "Projects | Anthony Lam" };

const statusLabel: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  early: "Early stage",
  school: "School project",
};

export default function Projects() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <ul className="mt-8 grid gap-4">
        {projects.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border border-foreground/10 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <span className="font-mono text-xs text-foreground/50">
                {statusLabel[p.status]}
                {p.period ? ` · ${p.period}` : ""}
              </span>
            </div>
            <p className="text-sm text-foreground/60">{p.tagline}</p>
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
    </div>
  );
}

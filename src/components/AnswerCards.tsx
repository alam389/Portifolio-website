"use client";

import { experiences, projects, skills, profile } from "@/data";
import type { BlockType } from "@/data/agent";

// Renders the structured block after a twin answer. All data is real @/data.

const SKILL_GROUPS: { label: string; category: string }[] = [
  { label: "Languages", category: "language" },
  { label: "Frameworks & Runtime", category: "framework" },
  { label: "Tools & Cloud", category: "tool" },
];

export function AnswerBlock({ block }: { block: BlockType }) {
  switch (block) {
    case "skills":
      return <SkillsBlock />;
    case "projects":
      return <ProjectsBlock />;
    case "experience":
      return <ExperienceBlock />;
    case "contact":
      return <ContactBlock />;
    case "resume":
      return <ResumeBlock />;
  }
}

function SkillsBlock() {
  return (
    <div className="reveal mt-3 space-y-3">
      {SKILL_GROUPS.map((group) => {
        const items = skills.filter((s) => s.category === group.category);
        if (items.length === 0) return null;
        return (
          <div key={group.category}>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((s) => (
                <span
                  key={s.name}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-[13px]"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectsBlock() {
  return (
    <div className="reveal mt-3 grid gap-2.5 sm:grid-cols-2">
      {projects.map((p) => (
        <div
          key={p.id}
          className="glass rounded-xl border border-border p-3.5"
        >
          <p className="font-medium leading-snug">{p.title}</p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted">
            {p.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {p.technologies.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted"
              >
                {t}
              </span>
            ))}
          </div>
          {(p.github || p.live) && (
            <div className="mt-2.5 flex gap-3 text-[12px]">
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fg underline-offset-2 hover:underline"
                >
                  GitHub ↗
                </a>
              )}
              {p.live && (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fg underline-offset-2 hover:underline"
                >
                  Live ↗
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceBlock() {
  return (
    <ol className="reveal mt-3 space-y-3 border-l border-border pl-4">
      {experiences.map((e) => {
        const current = e.status === "Current" || e.status === "In Progress";
        return (
          <li key={e.id} className="relative">
            <span
              className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${
                current ? "bg-ok" : "bg-border"
              }`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium">{e.title}</span>
              <span className="text-muted">· {e.company}</span>
              <span className="ml-auto font-mono text-[11px] text-muted">
                {e.period}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] leading-5 text-muted">
              {e.description}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function ContactBlock() {
  return (
    <div className="reveal mt-3 flex flex-wrap gap-2">
      {profile.socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target={s.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="glass rounded-full border border-border px-4 py-1.5 text-[13px] hover:border-fg/40"
        >
          {s.label} ↗
        </a>
      ))}
    </div>
  );
}

function ResumeBlock() {
  // TODO(Anthony): drop resume.pdf into /public and make this a real download link.
  return (
    <p className="reveal mt-3 rounded-lg border border-dashed border-border px-4 py-3 text-[13px] text-muted">
      My resume is being finalized — email{" "}
      <a
        href={`mailto:${profile.email}`}
        className="text-fg underline-offset-2 hover:underline"
      >
        {profile.email}
      </a>{" "}
      and I&apos;ll send the latest copy.
    </p>
  );
}

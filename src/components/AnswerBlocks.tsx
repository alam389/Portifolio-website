"use client";

import Link from "next/link";
import { experiences, skills, profile } from "@/data";
import type { AgentEntry, ProjectLink } from "@/data/agent";
import { useEffect, useState } from "react";

// Renders one agent answer: streamed text, then the structured block.

function useTyped(text: string): { shown: string; done: boolean } {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    let i = 0;
    const t = setInterval(() => {
      i += 3;
      setN(Math.min(i, text.length));
      if (i >= text.length) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [text]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

export function AnswerBlocks({
  entry,
  projects,
}: {
  entry: AgentEntry;
  projects: ProjectLink[];
}) {
  const { shown, done } = useTyped(entry.text);
  return (
    <div className="space-y-3">
      <p className="leading-7 text-foreground/90">
        {shown}
        {!done && (
          <span
            className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-foreground/70"
            aria-hidden="true"
          />
        )}
      </p>
      {done && entry.block === "skills" && <SkillChips />}
      {done && entry.block === "projects" && <ProjectCards projects={projects} />}
      {done && entry.block === "experience" && <ExperienceList />}
      {done && entry.block === "contact" && <ContactLinks />}
      {done && entry.block === "resume" && <ResumeStub />}
    </div>
  );
}

function SkillChips() {
  return (
    <div className="content-enter flex flex-wrap gap-2">
      {skills.map((s) => (
        <span
          key={s.name}
          className="flex items-center gap-1.5 rounded-full border border-border bg-sidebar px-3 py-1 text-[13px]"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: s.color }}
            aria-hidden="true"
          />
          {s.name}
        </span>
      ))}
    </div>
  );
}

function ProjectCards({ projects }: { projects: ProjectLink[] }) {
  return (
    <div className="content-enter grid gap-2.5 sm:grid-cols-2">
      {projects.map((p) => (
        <Link
          key={p.slug}
          href={p.slug}
          className="rounded-lg border border-border bg-sidebar p-3.5 outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          <p className="font-mono text-sm font-semibold text-accent">
            {p.title}
          </p>
          <p className="mt-1 line-clamp-3 text-[13px] leading-5 text-muted">
            {p.description}
          </p>
        </Link>
      ))}
    </div>
  );
}

function ExperienceList() {
  return (
    <ul className="content-enter space-y-2.5">
      {experiences.map((e) => (
        <li key={e.id} className="rounded-lg border border-border bg-sidebar p-3">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold">{e.title}</span>
            <span className="text-muted">· {e.company}</span>
            <span className="ml-auto font-mono text-[12px] text-muted">
              {e.period}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-muted">{e.description}</p>
        </li>
      ))}
    </ul>
  );
}

function ContactLinks() {
  return (
    <div className="content-enter flex flex-wrap gap-2.5">
      {profile.socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target={s.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="rounded-full border border-border bg-sidebar px-4 py-1.5 text-[13px] text-accent outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          {s.label} ↗
        </a>
      ))}
    </div>
  );
}

function ResumeStub() {
  // TODO(Anthony): drop the real resume.pdf into /public and turn this into
  // <a href="/resume.pdf" download>.
  return (
    <p className="content-enter rounded-lg border border-dashed border-border px-4 py-3 text-[13px] text-muted">
      resume.pdf is being polished — email{" "}
      <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
        {profile.email}
      </a>{" "}
      and I&apos;ll send the latest version.
    </p>
  );
}

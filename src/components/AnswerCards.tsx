"use client";

import { experiences, projects, skills, profile } from "@/data";
import type { BlockType } from "@/data/agent";

// Renders the structured block after a twin answer. All data is real @/data.
// Game-UI styling: skills = hotbar slots, projects = item tooltips,
// experience = quest log.

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

/* ---- skills: hotbar rows of inventory slots ---- */

function ItemCube({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      style={{
        background: color,
        boxShadow:
          "inset -2px -2px 0 rgba(0,0,0,0.35), inset 2px 2px 0 rgba(255,255,255,0.35)",
      }}
    />
  );
}

function SkillsBlock() {
  return (
    <div className="reveal mt-3 space-y-3">
      {SKILL_GROUPS.map((group) => {
        const items = skills.filter((s) => s.category === group.category);
        if (items.length === 0) return null;
        return (
          <div key={group.category}>
            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1">
              {items.map((s) => (
                <div
                  key={s.name}
                  title={s.name}
                  className="flex h-[64px] w-[64px] flex-col items-center justify-center gap-1 border-2 border-b-white/25 border-l-black/40 border-r-white/25 border-t-black/40 bg-black/25 px-1 transition-colors hover:bg-black/40"
                >
                  <ItemCube color={s.color} />
                  <span className="line-clamp-2 text-center text-[8px] leading-[9px] text-fg/85">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- projects: item tooltips (always dark + purple border, like the game) ---- */

function ProjectsBlock() {
  return (
    <div className="reveal mt-3 grid gap-2.5 sm:grid-cols-2">
      {projects.map((p) => (
        <div
          key={p.id}
          className="border-2 border-[#8a5cf5]/65 bg-[#100a1e]/95 p-3"
          style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.35)" }}
        >
          {/* item name — gold, like a legendary drop */}
          <p className="text-[13px] font-medium leading-snug text-[#ffd75e]">
            {p.title}
          </p>
          {/* lore lines */}
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#a8a8b8]">
            {p.description}
          </p>
          {/* enchantments */}
          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
            {p.technologies.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] text-[#8ab4f8]">
                {t}
              </span>
            ))}
          </div>
          {(p.github || p.live) && (
            <div className="mt-2 flex gap-3 text-[11px]">
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#e8e8f0] underline-offset-2 hover:underline"
                >
                  GitHub ↗
                </a>
              )}
              {p.live && (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#e8e8f0] underline-offset-2 hover:underline"
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

/* ---- experience: quest log ---- */

function ExperienceBlock() {
  return (
    <ol className="reveal mt-3 space-y-4 border-l-2 border-dashed border-border pl-4">
      {experiences.map((e) => {
        const active = e.status === "Current" || e.status === "In Progress";
        return (
          <li key={e.id} className="relative">
            <span
              className={`absolute -left-[23px] top-1 h-2.5 w-2.5 border ${
                active ? "border-ok bg-ok" : "border-border bg-surface"
              }`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                className={`border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                  active
                    ? "border-ok/60 text-ok"
                    : "border-border text-muted"
                }`}
              >
                {active ? "Active quest" : "Complete"}
              </span>
              <span className="text-[13px] font-medium">{e.title}</span>
              <span className="text-[13px] text-muted">· {e.company}</span>
              <span className="ml-auto text-[11px] text-muted">{e.period}</span>
            </div>
            <p className="mt-1 text-[13px] leading-5 text-muted">
              {e.description}
            </p>
            {/* objectives */}
            <ul className="mt-1.5 space-y-1">
              {e.achievements.map((a) => (
                <li key={a} className="flex items-start gap-2 text-[12px] leading-5 text-fg/80">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 bg-ok"
                    style={{
                      boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.35)",
                    }}
                    aria-hidden="true"
                  />
                  {a}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

/* ---- contact / resume (unchanged styling) ---- */

function ContactBlock() {
  return (
    <div className="reveal mt-3 flex flex-wrap gap-2">
      {profile.socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target={s.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="glass mc-btn border border-border px-4 py-1.5 text-[13px] hover:border-fg/40"
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
    <p className="reveal mt-3 border border-dashed border-border px-4 py-3 text-[13px] text-muted">
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

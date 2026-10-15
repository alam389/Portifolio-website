import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import AskAssistantButton from "@/components/assistant/AskAssistantButton";
import DecisionLog from "@/components/DecisionLog";
import { projects, projectStatusLabel } from "@/data";

// Only projects with an architecture diagram get a page for now.
const diagrammed = projects.filter((p) => p.architecture);

export const dynamicParams = false;

export function generateStaticParams() {
  return diagrammed.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = diagrammed.find((p) => p.id === id);
  return project
    ? { title: `${project.title} | Anthony Lam`, description: project.tagline }
    : {};
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = diagrammed.find((p) => p.id === id);
  if (!project?.architecture) notFound();

  return (
    <article>
      <Link
        href="/projects"
        className="text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        ← Projects
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{project.title}</h1>
      <p className="mt-2 font-mono text-xs text-muted">
        {projectStatusLabel[project.status]}
        {project.period ? ` · ${project.period}` : ""} · {project.technologies.join(" / ")}
      </p>
      <p className="mt-3 text-foreground/70">{project.tagline}</p>
      {(project.github || project.live) && (
        <div className="mt-4 flex gap-5 text-sm">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              GitHub <span aria-hidden className="text-muted">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              Live <span aria-hidden className="text-muted">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      )}

      {project.video && (
        <video
          src={project.video.src}
          aria-label={project.video.label}
          controls
          playsInline
          preload="metadata"
          className="mt-10 aspect-video w-full rounded-md border border-foreground/10 bg-surface object-contain"
        />
      )}

      {project.story && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">The story</h2>
          <div className="mt-4 flex max-w-lg flex-col gap-4 leading-relaxed text-foreground/85">
            {project.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* The diagram and its decisions are one chapter: how one part of the project works. */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">
          {project.architecture.title ?? "How it works"}
        </h2>
        {project.architecture.summary && (
          <p className="mt-2 max-w-lg text-foreground/70">{project.architecture.summary}</p>
        )}
        <div className="mt-6">
          <ArchitectureDiagram architecture={project.architecture} />
        </div>

        {project.decisions && project.decisions.length > 0 && (
          <div className="mt-10">
            <h3 className="font-mono text-xs tracking-wide text-muted uppercase">Decisions</h3>
            <p className="mt-2 text-sm text-foreground/70">
              The choices behind it, as architecture decision records. Open one for the context,
              what was decided and what it costs.
            </p>
            <div className="mt-4">
              <DecisionLog decisions={project.decisions} />
            </div>
          </div>
        )}
      </section>

      <nav
        aria-label="More"
        className="mt-14 flex items-baseline justify-between gap-6 border-t border-foreground/10 pt-6 text-sm"
      >
        <Link href="/projects" className="text-foreground/60 transition-colors hover:text-foreground">
          ← All projects
        </Link>
        {project.architecture.assistant && <AskAssistantButton />}
      </nav>
    </article>
  );
}

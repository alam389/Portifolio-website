import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
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

      <section className="mt-10">
        <h2 className="font-mono text-xs tracking-wide text-muted uppercase">How it works</h2>
        <div className="mt-4">
          <ArchitectureDiagram architecture={project.architecture} />
        </div>
      </section>

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
        <section className="mt-10">
          <h2 className="font-mono text-xs tracking-wide text-muted uppercase">The story</h2>
          <div className="mt-4 flex flex-col gap-4 leading-relaxed text-foreground/85">
            {project.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

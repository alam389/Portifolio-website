import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  experiences,
  volunteering,
  projects,
  projectStatusLabel,
  skills,
  type Experience as Job,
} from "@/data";

export const metadata: Metadata = { title: "Experience | Anthony Lam" };

const headingClass =
  "border-b border-foreground/20 pb-2 text-3xl font-semibold tracking-tight";

function Section({
  title,
  first = false,
  children,
}: {
  title: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section>
      {first ? (
        <h1 className={headingClass}>{title}</h1>
      ) : (
        <h2 className={headingClass}>{title}</h2>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Row({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
      {left}
      {right}
    </div>
  );
}

function Jobs({ jobs }: { jobs: Job[] }) {
  return (
    <ol className="flex flex-col gap-8">
      {jobs.map((job) => (
        <li key={job.id}>
          <Row
            left={<h3 className="text-lg font-semibold">{job.company}</h3>}
            right={
              <span className="text-sm text-foreground/60">{job.location}</span>
            }
          />
          <Row
            left={<p className="italic text-foreground/80">{job.title}</p>}
            right={
              <span className="font-mono text-sm text-foreground/60">
                {job.period}
              </span>
            }
          />
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-foreground/80 marker:text-foreground/40">
            {job.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default function Experience() {
  return (
    <div className="flex flex-col gap-14">
      <Section title="Experience" first>
        <Jobs jobs={experiences} />
      </Section>

      <Section title="Volunteer">
        <Jobs jobs={volunteering} />
      </Section>

      <Section title="Projects">
        <ol className="flex flex-col gap-8">
          {projects.map((p) => (
            <li key={p.id}>
              <Row
                left={
                  <h3 className="text-lg">
                    <span className="font-semibold">{p.title}</span>
                    <span className="text-foreground/40"> | </span>
                    <span className="italic text-foreground/70">
                      {p.technologies.join(", ")}
                    </span>
                  </h3>
                }
                right={
                  <span className="font-mono text-sm text-foreground/60">
                    {p.period ?? projectStatusLabel[p.status]}
                  </span>
                }
              />
              <p className="mt-2 text-foreground/80">{p.description}</p>
              {(p.github || p.live) && (
                <div className="mt-1.5 flex gap-4 text-sm text-foreground/60">
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      Live ↗
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Skills">
        <dl className="flex flex-col gap-2 text-foreground/80">
          {skills.map((group) => (
            <div key={group.label}>
              <dt className="inline font-semibold text-foreground">
                {group.label}:{" "}
              </dt>
              <dd className="inline">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}

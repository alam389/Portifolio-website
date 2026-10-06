import type { Metadata } from "next";
import { experiences } from "@/data";

export const metadata: Metadata = { title: "Experience | Anthony Lam" };

export default function Experience() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Experience</h1>
      <ol className="mt-8 flex flex-col gap-10">
        {experiences.map((job) => (
          <li key={job.id}>
            <h2 className="text-lg font-semibold">
              {job.title} · {job.company}
            </h2>
            <p className="font-mono text-sm text-foreground/50">
              {job.period} · {job.location}
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-foreground/80">
              {job.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

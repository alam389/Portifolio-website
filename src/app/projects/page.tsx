import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectList from "@/components/ProjectList";
import { projects } from "@/data";

export const metadata: Metadata = { title: "Projects | Anthony Lam" };

export default function Projects() {
  return (
    <div>
      <h1 className="border-b border-foreground/20 pb-2 text-3xl font-semibold tracking-tight">
        Projects
      </h1>
      <Suspense>
        <ProjectList projects={projects} />
      </Suspense>
    </div>
  );
}

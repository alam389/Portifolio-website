import type { Metadata } from "next";
import ProjectList from "@/components/ProjectList";
import { projects } from "@/data";

export const metadata: Metadata = { title: "Projects | Anthony Lam" };

export default function Projects() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
}

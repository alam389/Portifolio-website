import { allFiles } from "../../content/manifest";
import { getMeta } from "@/lib/content";
import { Chat } from "@/components/Chat";

// "/" — the digital-twin chat (tree node: src/pages/digital-twin.tsx).
// Project cards are pregenerated here from the IDE pages' real frontmatter.

export default async function Home() {
  const readmes = allFiles().filter(
    (f) => f.slug.startsWith("/projects/") && f.label === "README.md",
  );
  const projects = await Promise.all(
    readmes.map(async (f) => {
      const meta = await getMeta(f);
      return { slug: f.slug, title: meta.title, description: meta.description };
    }),
  );
  return <Chat projects={projects} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookItem, live, PaperItem, PodcastItem } from "@/components/interests/Items";
import SectionPage, { Subsection } from "@/components/interests/SectionPage";
import { getSection } from "@/components/interests/sections";
import { books, papers, podcasts } from "@/data";

export const metadata: Metadata = { title: "AI | Anthony Lam" };

const list = "mt-4 divide-y divide-foreground/10";

export default function AiPage() {
  const section = getSection("ai");
  const shownPapers = live(papers);
  const shownBooks = live(books);
  const shownPodcasts = live(podcasts);

  const subsections = [
    shownPapers.length > 0 && { id: "papers", label: "Papers" },
    shownBooks.length > 0 && { id: "books", label: "Books" },
    shownPodcasts.length > 0 && { id: "podcasts", label: "Podcasts" },
  ].filter((s) => s !== false);
  if (subsections.length === 0) notFound();

  return (
    <SectionPage section={section} subsections={subsections}>
      {shownPapers.length > 0 && (
        <Subsection id="papers" title="Papers">
          <ul className={list}>
            {shownPapers.map((p) => (
              <PaperItem key={p.id} paper={p} />
            ))}
          </ul>
        </Subsection>
      )}

      {shownBooks.length > 0 && (
        <Subsection id="books" title="Books">
          <ul className={list}>
            {shownBooks.map((b) => (
              <BookItem key={b.id} book={b} />
            ))}
          </ul>
        </Subsection>
      )}

      {shownPodcasts.length > 0 && (
        <Subsection id="podcasts" title="Podcasts">
          <ul className={list}>
            {shownPodcasts.map((p) => (
              <PodcastItem key={p.id} podcast={p} />
            ))}
          </ul>
        </Subsection>
      )}
    </SectionPage>
  );
}

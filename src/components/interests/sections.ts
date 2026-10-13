import {
  activities,
  books,
  dishes,
  interestIntros,
  papers,
  podcasts,
  restaurants,
  type Photo,
} from "@/data";
import { live, paperHref } from "./Items";

/** One entry previewed on the Interests overview. */
export type Preview = {
  key: string;
  /** Small label above the title, e.g. "Paper". */
  kind?: string;
  title: string;
  meta?: string;
  /** Anthony's one-line take, when the entry has one. */
  takeaway?: string;
  href?: string;
  /** Photo: a small square on index rows, the tile itself on galleries. */
  thumb?: Photo;
  draft?: string;
};

export type InterestSection = {
  id: string;
  title: string;
  intro: string;
  /**
   * How the overview shows it: "index" for text rows (reading lists),
   * "gallery" for photo tiles under Hobbies.
   */
  layout: "index" | "gallery";
  /** Preview rows per subsection, in display order. Array order is curation. */
  previews: () => Preview[][];
};

// Each subsection gets a turn, so a preview shows the range of the section
// (a paper, a book, a podcast) rather than three of the first kind.
export function pickPreviews(lists: Preview[][], max = 3) {
  const picked: Preview[] = [];
  for (let i = 0; picked.length < max; i++) {
    const round = lists.filter((l) => i < l.length).map((l) => l[i]);
    if (round.length === 0) break;
    picked.push(...round.slice(0, max - picked.length));
  }
  return picked;
}

// Galleries are photo-led: within the round-robin, entries with a photo go
// first, so a row fills with pictures before it falls back to blank tiles.
export function pickGallery(lists: Preview[][], max = 3) {
  const photosFirst = (l: Preview[]) => [...l].sort((x, y) => +!!y.thumb - +!!x.thumb);
  return photosFirst(pickPreviews(lists.map(photosFirst), max));
}

export function hasContent(section: InterestSection) {
  return section.previews().some((l) => l.length > 0);
}

// Adding a section: an entry here plus a page at src/app/interests/<id>/.
export const interestSections: InterestSection[] = [
  {
    id: "ai",
    title: "AI",
    layout: "index",
    intro: interestIntros.ai,
    previews: () => [
      live(papers).map((p) => ({
        key: p.id,
        kind: "Paper",
        title: p.title,
        meta: `${p.authors} · ${p.year}`,
        takeaway: p.takeaway,
        href: paperHref(p),
        draft: p.draft,
      })),
      live(books).map((b) => ({
        key: b.id,
        kind: "Book",
        title: b.title,
        meta: `${b.authors} · ${b.year}`,
        takeaway: b.takeaway,
        href: b.url,
        draft: b.draft,
      })),
      live(podcasts).map((p) => ({
        key: p.id,
        kind: "Podcast",
        title: p.episode ?? p.show,
        meta: [p.episode && p.show, p.date].filter(Boolean).join(" · ") || undefined,
        takeaway: p.takeaway,
        href: p.url,
        draft: p.draft,
      })),
    ],
  },
  {
    id: "food",
    title: "Food",
    layout: "gallery",
    intro: interestIntros.food,
    previews: () => [
      live(dishes).map((d) => ({
        key: d.id,
        kind: "Dish",
        title: d.name,
        meta: [d.cuisine, d.note].filter(Boolean).join(" · ") || undefined,
        thumb: d.photo,
        draft: d.draft,
      })),
      live(restaurants).map((r) => ({
        key: r.id,
        kind: "Restaurant",
        title: r.name,
        meta: `${r.city} · ${r.cuisine}`,
        href: r.mapsUrl,
        draft: r.draft,
      })),
    ],
  },
  {
    id: "active",
    title: "Active",
    layout: "gallery",
    intro: interestIntros.active,
    previews: () => [
      live(activities).map((a) => ({
        key: a.id,
        title: a.title,
        meta: a.description,
        thumb: a.photo,
        draft: a.draft,
      })),
    ],
  },
];

export function getSection(id: string) {
  const section = interestSections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown interest section: ${id}`);
  return section;
}

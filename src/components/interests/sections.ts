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

/** One compact row on an overview card. */
export type Preview = {
  key: string;
  /** Small label above the title, e.g. "Paper". */
  kind?: string;
  title: string;
  meta?: string;
  /** Anthony's one-line take, when the entry has one. */
  takeaway?: string;
  href?: string;
  /** Square thumbnail, for entries with a photo. */
  thumb?: Photo;
  draft?: string;
};

export type InterestSection = {
  id: string;
  title: string;
  intro: string;
  /** Preview rows per subsection, in display order. Array order is curation. */
  previews: () => Preview[][];
};

// Each subsection gets a turn, so a card shows the range of the section
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

export function hasContent(section: InterestSection) {
  return section.previews().some((l) => l.length > 0);
}

// Adding a section: an entry here plus a page at src/app/interests/<id>/.
export const interestSections: InterestSection[] = [
  {
    id: "ai",
    title: "AI",
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
        title: p.episode,
        meta: `${p.show} · ${p.date}`,
        takeaway: p.takeaway,
        href: p.url,
        draft: p.draft,
      })),
    ],
  },
  {
    id: "food",
    title: "Food",
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
    intro: interestIntros.active,
    previews: () => [
      live(activities).map((a) => ({
        key: a.id,
        title: a.title,
        meta: a.facts.join(" · ") || undefined,
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

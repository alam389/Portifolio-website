import Image from "next/image";
import Link from "next/link";
import type { Activity, Book, Dish, Paper, Podcast, Restaurant } from "@/data";

// Drafts are visible while editing locally but never ship.
const showDrafts = process.env.NODE_ENV !== "production";
export function live<T extends { draft?: string }>(entries: T[]) {
  return showDrafts ? entries : entries.filter((e) => !e.draft);
}

// Cities in the order they first appear in restaurants.ts.
export function byCity(list: Restaurant[]) {
  const groups = new Map<string, Restaurant[]>();
  for (const r of list) groups.set(r.city, [...(groups.get(r.city) ?? []), r]);
  return [...groups];
}

/** Where a paper's title links: its summary page if it has one, else the paper. */
export function paperHref(paper: Paper) {
  return paper.summary ? `/interests/ai/papers/${paper.id}` : paper.url;
}

/**
 * A link title with its arrow (→ to a page here, ↗ off-site). The arrow is
 * glued to the last word so a long title never wraps it onto a line alone.
 */
export function ArrowTitle({ title, external }: { title: string; external: boolean }) {
  const cut = title.lastIndexOf(" ") + 1;
  return (
    <>
      {title.slice(0, cut)}
      <span className="whitespace-nowrap">
        {title.slice(cut)}{" "}
        <span aria-hidden className="text-muted">
          {external ? "↗" : "→"}
        </span>
      </span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );
}

export function DraftBadge({ note }: { note: string }) {
  return (
    <span
      title={note}
      className="rounded border border-amber-300/40 px-1.5 font-mono text-xs uppercase text-amber-300/90 light:border-amber-700/40 light:text-amber-700"
    >
      Draft
    </span>
  );
}

/** Plain-text metadata (topics, facts). Not pills: pills here are links. */
export function MetaList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <p className="mt-1.5 font-mono text-xs text-muted">
      <span className="sr-only">{label}: </span>
      {items.join(" · ")}
    </p>
  );
}

const titleLink = "font-semibold underline-offset-4 hover:underline";

function OutLink({ href, title }: { href: string; title: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={titleLink}>
      <ArrowTitle title={title} external />
    </a>
  );
}

function Takeaway({ text }: { text?: string }) {
  return text ? <p className="mt-2 text-sm text-foreground/80">{text}</p> : null;
}

export function PaperItem({ paper }: { paper: Paper }) {
  return (
    <li className="py-5 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {paper.summary ? (
          <Link href={paperHref(paper)} className={titleLink}>
            <ArrowTitle title={paper.title} external={false} />
          </Link>
        ) : (
          <OutLink href={paper.url} title={paper.title} />
        )}
        {paper.draft && <DraftBadge note={paper.draft} />}
      </div>
      <p className="mt-1 font-mono text-xs text-muted">
        {paper.authors} · {paper.venue ? `${paper.venue} ` : ""}
        {paper.year}
        {paper.summary && (
          <>
            {" · "}
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${paper.title}, the paper (opens in a new tab)`}
              className="whitespace-nowrap underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Paper <span aria-hidden>↗</span>
            </a>
          </>
        )}
      </p>
      <Takeaway text={paper.takeaway} />
      <MetaList label="Topics" items={paper.tags} />
    </li>
  );
}

export function BookItem({ book }: { book: Book }) {
  return (
    <li className="py-5 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <OutLink href={book.url} title={book.title} />
        {book.draft && <DraftBadge note={book.draft} />}
      </div>
      <p className="mt-1 font-mono text-xs text-muted">
        {book.authors} · {book.publisher ? `${book.publisher} ` : ""}
        {book.year}
      </p>
      <Takeaway text={book.takeaway} />
      <MetaList label="Topics" items={book.tags} />
    </li>
  );
}

export function PodcastItem({ podcast: p }: { podcast: Podcast }) {
  return (
    <li className="py-5 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <OutLink href={p.url} title={p.episode} />
        {p.draft && <DraftBadge note={p.draft} />}
      </div>
      <p className="mt-1 font-mono text-xs text-muted">
        {[p.show, p.guest && `with ${p.guest}`, p.date].filter(Boolean).join(" · ")}
      </p>
      <Takeaway text={p.takeaway} />
      <MetaList label="Topics" items={p.tags} />
    </li>
  );
}

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5">
      {dish.photo && (
        <>
          <Image
            src={dish.photo.src}
            alt={dish.photo.alt}
            fill
            sizes="(min-width: 768px) 240px, 50vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
        </>
      )}
      {dish.draft && (
        <div className="absolute top-2.5 left-2.5">
          <DraftBadge note={dish.draft} />
        </div>
      )}
      <div className={`absolute inset-x-0 bottom-0 p-3 ${dish.photo ? "text-white" : ""}`}>
        <p className="font-semibold leading-tight">{dish.name}</p>
        {(dish.note || dish.cuisine) && (
          <p className={`mt-0.5 text-xs ${dish.photo ? "opacity-80" : "text-muted"}`}>
            {[dish.cuisine, dish.note].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </li>
  );
}

export function RestaurantRow({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        {r.mapsUrl ? (
          <a
            href={r.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            <ArrowTitle title={r.name} external />
          </a>
        ) : (
          <span className="font-medium">{r.name}</span>
        )}
        <span className="text-sm text-muted">{r.cuisine}</span>
        {r.draft && <DraftBadge note={r.draft} />}
      </div>
      <p className="mt-0.5 text-sm text-foreground/80">
        <span className="text-muted">Order:</span> {r.order}
      </p>
    </li>
  );
}

export function ActivityCard({ activity: a }: { activity: Activity }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-foreground/10">
      {a.photo && (
        <div className="relative aspect-video">
          <Image
            src={a.photo.src}
            alt={a.photo.alt}
            fill
            sizes="(min-width: 640px) 360px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold">{a.title}</h3>
          {a.draft && <DraftBadge note={a.draft} />}
        </div>
        <p className="mt-1 text-sm text-foreground/80">{a.description}</p>
        <MetaList label="Details" items={a.facts} />
        {a.prs && a.prs.length > 0 && (
          <dl className="mt-auto grid grid-cols-3 gap-2 pt-4">
            {a.prs.map((pr) => (
              <div key={pr.label} className="rounded-md bg-foreground/5 px-2.5 py-2">
                <dt className="text-xs text-muted">{pr.label}</dt>
                <dd className="font-mono text-sm">{pr.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </li>
  );
}

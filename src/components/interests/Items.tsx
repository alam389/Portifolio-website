import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChefHat } from "lucide-react";
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

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul aria-label="Topics" className="mt-2.5 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-foreground/15 px-2.5 py-0.5 text-xs text-foreground/70"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold underline-offset-4 hover:underline"
    >
      {children} <span aria-hidden className="text-foreground/40">↗</span>
    </a>
  );
}

export function PaperItem({ paper }: { paper: Paper }) {
  return (
    <li className="py-5 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {paper.summary ? (
          <>
            <Link
              href={paperHref(paper)}
              className="font-semibold underline-offset-4 hover:underline"
            >
              {paper.title} <span aria-hidden className="text-foreground/40">→</span>
            </Link>
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground/50 transition-colors hover:text-foreground"
            >
              Paper <span aria-hidden>↗</span>
            </a>
          </>
        ) : (
          <OutLink href={paper.url}>{paper.title}</OutLink>
        )}
        {paper.draft && <DraftBadge note={paper.draft} />}
      </div>
      <p className="mt-0.5 font-mono text-xs text-foreground/50">
        {paper.authors} · {paper.venue ? `${paper.venue} ` : ""}
        {paper.year}
      </p>
      {paper.takeaway && (
        <p className="mt-2 text-sm text-foreground/80">{paper.takeaway}</p>
      )}
      <Tags tags={paper.tags} />
    </li>
  );
}

export function BookItem({ book }: { book: Book }) {
  return (
    <li className="py-5 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <OutLink href={book.url}>{book.title}</OutLink>
        {book.draft && <DraftBadge note={book.draft} />}
      </div>
      <p className="mt-0.5 font-mono text-xs text-foreground/50">
        {book.authors} · {book.publisher ? `${book.publisher} ` : ""}
        {book.year}
      </p>
      {book.takeaway && (
        <p className="mt-2 text-sm text-foreground/80">{book.takeaway}</p>
      )}
      <Tags tags={book.tags} />
    </li>
  );
}

export function PodcastItem({ podcast: p }: { podcast: Podcast }) {
  return (
    <li className="py-5 first:pt-0">
      <p className="font-mono text-xs tracking-wide text-foreground/50 uppercase">
        {p.show}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <OutLink href={p.url}>{p.episode}</OutLink>
        {p.draft && <DraftBadge note={p.draft} />}
      </div>
      <p className="mt-0.5 font-mono text-xs text-foreground/50">
        {[p.guest && `with ${p.guest}`, p.date].filter(Boolean).join(" · ")}
      </p>
      {p.takeaway && (
        <p className="mt-2 text-sm text-foreground/80">{p.takeaway}</p>
      )}
      <Tags tags={p.tags} />
    </li>
  );
}

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5">
      {dish.photo ? (
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
      ) : (
        <ChefHat
          size={40}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-1/2 -mt-4 text-foreground/15"
        />
      )}
      {dish.draft && (
        <div className="absolute top-2.5 left-2.5">
          <DraftBadge note={dish.draft} />
        </div>
      )}
      <div className={`absolute inset-x-0 bottom-0 p-3 ${dish.photo ? "text-white" : ""}`}>
        <p className="font-semibold leading-tight">{dish.name}</p>
        {(dish.note || dish.cuisine) && (
          <p className="mt-0.5 text-xs opacity-75">
            {[dish.cuisine, dish.note].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </li>
  );
}

export function RestaurantRow({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        {r.mapsUrl ? (
          <a
            href={r.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            {r.name} <span aria-hidden className="text-foreground/40">↗</span>
          </a>
        ) : (
          <span className="font-medium">{r.name}</span>
        )}
        <span className="text-sm text-foreground/50">{r.cuisine}</span>
        {r.draft && <DraftBadge note={r.draft} />}
      </div>
      <p className="text-sm text-foreground/80">
        <span className="text-foreground/50">Order:</span> {r.order}
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
        <ul aria-label="Details" className="mt-3 flex flex-wrap gap-1.5">
          {a.facts.map((fact) => (
            <li
              key={fact}
              className="rounded-full border border-foreground/15 px-2.5 py-0.5 text-xs text-foreground/70"
            >
              {fact}
            </li>
          ))}
        </ul>
        {a.prs && a.prs.length > 0 && (
          <dl className="mt-auto grid grid-cols-3 gap-2 pt-4">
            {a.prs.map((pr) => (
              <div key={pr.label} className="rounded-md bg-foreground/5 px-2.5 py-2">
                <dt className="text-xs text-foreground/50">{pr.label}</dt>
                <dd className="font-mono text-sm">{pr.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </li>
  );
}

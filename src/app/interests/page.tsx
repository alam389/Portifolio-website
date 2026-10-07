import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Brain, ChefHat, Dumbbell, type LucideIcon } from "lucide-react";
import JumpLinks from "@/components/JumpLinks";
import {
  activities,
  dishes,
  interestIntros,
  papers,
  restaurants,
  type Activity,
  type Dish,
  type Paper,
  type Restaurant,
} from "@/data";

export const metadata: Metadata = { title: "Interests | Anthony Lam" };

// Drafts are visible while editing locally but never ship.
const showDrafts = process.env.NODE_ENV !== "production";
function live<T extends { draft?: string }>(entries: T[]) {
  return showDrafts ? entries : entries.filter((e) => !e.draft);
}

// Cities in the order they first appear in restaurants.ts.
function byCity(list: Restaurant[]) {
  const groups = new Map<string, Restaurant[]>();
  for (const r of list) groups.set(r.city, [...(groups.get(r.city) ?? []), r]);
  return [...groups];
}

function DraftBadge({ note }: { note: string }) {
  return (
    <span
      title={note}
      className="rounded border border-amber-300/40 px-1.5 font-mono text-xs uppercase text-amber-300/90 light:border-amber-700/40 light:text-amber-700"
    >
      Draft
    </span>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  intro,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-16 scroll-mt-8">
      <h2 id={`${id}-heading`} className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
        <Icon size={22} aria-hidden className="text-foreground/50" />
        {title}
      </h2>
      {intro && <p className="mt-1 text-foreground/60">{intro}</p>}
      {children}
    </section>
  );
}

function PaperItem({ paper }: { paper: Paper }) {
  return (
    <li className="py-5 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {paper.summary ? (
          <>
            <Link
              href={`/interests/papers/${paper.id}`}
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
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline-offset-4 hover:underline"
          >
            {paper.title} <span aria-hidden className="text-foreground/40">↗</span>
          </a>
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
      <ul aria-label="Topics" className="mt-2.5 flex flex-wrap gap-1.5">
        {paper.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-foreground/15 px-2.5 py-0.5 text-xs text-foreground/70"
          >
            {tag}
          </li>
        ))}
      </ul>
    </li>
  );
}

function DishCard({ dish }: { dish: Dish }) {
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

function RestaurantRow({ restaurant: r }: { restaurant: Restaurant }) {
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

function ActivityCard({ activity: a }: { activity: Activity }) {
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

export default function Interests() {
  const shownPapers = live(papers);
  const shownDishes = live(dishes);
  const shownRestaurants = live(restaurants);
  const shownActivities = live(activities);
  const hasFood = shownDishes.length > 0 || shownRestaurants.length > 0;

  // Empty sections (all drafts, in production) drop out along with their link.
  const sections = [
    shownPapers.length > 0 && { id: "ai", label: "AI" },
    hasFood && { id: "food", label: "Food" },
    shownActivities.length > 0 && { id: "active", label: "Active" },
  ].filter((s) => s !== false);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Interests</h1>
      <p className="mt-2 max-w-md text-foreground/60">
        What I&apos;m into when I&apos;m not working.
      </p>

      {sections.length > 1 && <JumpLinks links={sections} />}
      {sections.length === 0 && (
        <p className="mt-8 text-sm text-foreground/50">More here soon.</p>
      )}

      {shownPapers.length > 0 && (
        <Section id="ai" icon={Brain} title="AI" intro={interestIntros.ai}>
          <ul className="mt-6 divide-y divide-foreground/10">
            {shownPapers.map((p) => (
              <PaperItem key={p.id} paper={p} />
            ))}
          </ul>
        </Section>
      )}

      {hasFood && (
        <Section id="food" icon={ChefHat} title="Food">
          {shownDishes.length > 0 && (
            <>
              <h3 className="mt-6 text-lg font-semibold">What I cook</h3>
              <p className="text-sm text-foreground/60">{interestIntros.cook}</p>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {shownDishes.map((d) => (
                  <DishCard key={d.id} dish={d} />
                ))}
              </ul>
            </>
          )}

          {shownRestaurants.length > 0 && (
            <>
              <h3 className="mt-10 text-lg font-semibold">Where I eat</h3>
              <p className="text-sm text-foreground/60">{interestIntros.eat}</p>
              {byCity(shownRestaurants).map(([city, list]) => (
                <div key={city} className="mt-5">
                  <h4 className="font-mono text-xs tracking-wide text-foreground/50 uppercase">
                    {city}
                  </h4>
                  <ul className="mt-1 divide-y divide-foreground/10">
                    {list.map((r) => (
                      <RestaurantRow key={r.id} restaurant={r} />
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </Section>
      )}

      {shownActivities.length > 0 && (
        <Section id="active" icon={Dumbbell} title="Active" intro={interestIntros.active}>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {shownActivities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { DraftBadge } from "./Items";
import { pickPreviews, type InterestSection, type Preview } from "./sections";

function Thumb({ thumb }: { thumb: NonNullable<Preview["thumb"]> }) {
  return (
    <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-foreground/10 bg-foreground/5">
      {thumb === "placeholder" ? (
        <ChefHat
          size={18}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-1/2 text-foreground/25"
        />
      ) : (
        <Image src={thumb.src} alt={thumb.alt} fill sizes="40px" className="object-cover" />
      )}
    </span>
  );
}

function PreviewTitle({ preview: p }: { preview: Preview }) {
  if (!p.href) return <span className="font-medium">{p.title}</span>;
  const external = p.href.startsWith("http");
  const className = "font-medium underline-offset-4 hover:underline";
  return external ? (
    <a href={p.href} target="_blank" rel="noopener noreferrer" className={className}>
      {p.title} <span aria-hidden className="text-foreground/40">↗</span>
    </a>
  ) : (
    <Link href={p.href} className={className}>
      {p.title}
    </Link>
  );
}

function PreviewRow({ preview: p }: { preview: Preview }) {
  return (
    <li className="flex items-center gap-3 py-3">
      {p.thumb && <Thumb thumb={p.thumb} />}
      <div className="min-w-0">
        {(p.kind || p.draft) && (
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-foreground/45 uppercase">
            {p.kind}
            {p.draft && <DraftBadge note={p.draft} />}
          </p>
        )}
        <p className="line-clamp-2 text-sm leading-snug">
          <PreviewTitle preview={p} />
        </p>
        {p.meta && <p className="mt-0.5 truncate text-xs text-foreground/50">{p.meta}</p>}
      </div>
    </li>
  );
}

/** An interest on the overview: a short preview and a way into the full page. */
export default function InterestCard({ section }: { section: InterestSection }) {
  const { id, title, icon: Icon, intro } = section;
  const href = `/interests/${id}`;
  const previews = pickPreviews(section.previews());

  return (
    <li className="flex flex-col rounded-xl border border-foreground/10 bg-surface p-5">
      <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
        <Icon size={20} aria-hidden className="text-foreground/50" />
        <Link href={href} className="underline-offset-4 hover:underline">
          {title}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-foreground/60">{intro}</p>

      <ul className="mt-3 flex-1 divide-y divide-foreground/10">
        {previews.map((p) => (
          <PreviewRow key={p.key} preview={p} />
        ))}
      </ul>

      <Link
        href={href}
        aria-label={`See all of ${title}`}
        className="mt-3 self-start text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        See all <span aria-hidden>→</span>
      </Link>
    </li>
  );
}

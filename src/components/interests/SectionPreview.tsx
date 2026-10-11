import Image from "next/image";
import Link from "next/link";
import { ArrowTitle, DraftBadge } from "./Items";
import { pickPreviews, type InterestSection, type Preview } from "./sections";

function PreviewTitle({ preview: p }: { preview: Preview }) {
  if (!p.href) return <span className="font-medium">{p.title}</span>;
  const external = p.href.startsWith("http");
  const className = "font-medium underline-offset-4 hover:underline";
  return external ? (
    <a href={p.href} target="_blank" rel="noopener noreferrer" className={className}>
      <ArrowTitle title={p.title} external />
    </a>
  ) : (
    <Link href={p.href} className={className}>
      <ArrowTitle title={p.title} external={false} />
    </Link>
  );
}

// Kind sits in its own left column from sm up, so titles line up down the index.
function PreviewRow({ preview: p }: { preview: Preview }) {
  return (
    <li className="py-4 sm:grid sm:grid-cols-[6.5rem_1fr] sm:gap-x-4">
      <p className="font-mono text-[11px] leading-6 tracking-wide text-muted uppercase">
        {p.kind}
      </p>
      <div className="flex min-w-0 gap-3">
        {p.thumb && (
          <span className="relative mt-0.5 size-10 shrink-0 overflow-hidden rounded-md bg-foreground/5">
            <Image src={p.thumb.src} alt={p.thumb.alt} fill sizes="40px" className="object-cover" />
          </span>
        )}
        <div className="min-w-0">
          <p className="leading-snug">
            <PreviewTitle preview={p} />
            {p.draft && (
              <span className="ml-2 align-middle">
                <DraftBadge note={p.draft} />
              </span>
            )}
          </p>
          {p.meta && <p className="mt-1 truncate font-mono text-xs text-muted">{p.meta}</p>}
          {p.takeaway && (
            <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">{p.takeaway}</p>
          )}
        </div>
      </div>
    </li>
  );
}

/** An interest on the overview: heading, intro, a few entries, a way in. */
export default function SectionPreview({
  section,
  max,
}: {
  section: InterestSection;
  /** How many entries to preview. */
  max: number;
}) {
  const { id, title, intro } = section;
  const href = `/interests/${id}`;
  const previews = pickPreviews(section.previews(), max);

  return (
    <section aria-labelledby={`${id}-heading`} className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={`${id}-heading`} className="text-2xl font-semibold tracking-tight">
          <Link href={href} className="underline-offset-4 hover:underline">
            {title}
          </Link>
        </h2>
        <Link
          href={href}
          aria-label={`See all of ${title}`}
          className="shrink-0 text-sm text-muted transition-colors hover:text-foreground"
        >
          See all <span aria-hidden>→</span>
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">{intro}</p>

      <ul className="mt-3 divide-y divide-foreground/10 border-t border-foreground/10">
        {previews.map((p) => (
          <PreviewRow key={p.key} preview={p} />
        ))}
      </ul>
    </section>
  );
}

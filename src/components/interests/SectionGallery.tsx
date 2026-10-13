import Image from "next/image";
import Link from "next/link";
import { ArrowTitle, DraftBadge } from "./Items";
import { pickGallery, type InterestSection, type Preview } from "./sections";

function Tile({ preview: p, fallbackHref }: { preview: Preview; fallbackHref: string }) {
  const href = p.href ?? fallbackHref;
  const external = href.startsWith("http");
  const body = (
    <>
      <span className="relative block aspect-4/3 overflow-hidden rounded-xl bg-foreground/5">
        {p.thumb ? (
          <Image
            src={p.thumb.src}
            alt={p.thumb.alt}
            fill
            sizes="(min-width: 640px) 240px, 70vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          p.kind && (
            <span className="absolute inset-0 grid place-items-center font-mono text-[11px] tracking-wide text-muted uppercase">
              {p.kind}
            </span>
          )
        )}
        {p.draft && (
          <span className="absolute top-2.5 left-2.5">
            <DraftBadge note={p.draft} />
          </span>
        )}
      </span>
      <span className="mt-3 block font-medium underline-offset-4 group-hover:underline">
        <ArrowTitle title={p.title} external={external} />
      </span>
    </>
  );

  return (
    <li className="w-[70%] shrink-0 snap-start sm:w-auto">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
          {body}
        </a>
      ) : (
        <Link href={href} className="group block">
          {body}
        </Link>
      )}
      {p.meta && <p className="mt-1 line-clamp-2 text-sm text-muted">{p.meta}</p>}
    </li>
  );
}

/**
 * A hobby on the overview: its label in a narrow left column (above the
 * photos below lg), and up to three photo tiles. On phones the tiles become
 * a swipeable row rather than shrinking to thumbnails.
 */
export default function SectionGallery({ section }: { section: InterestSection }) {
  const { id, title, intro } = section;
  const href = `/interests/${id}`;
  const previews = pickGallery(section.previews());

  return (
    <section aria-labelledby={`${id}-heading`} className="mt-10 lg:grid lg:grid-cols-[8rem_1fr] lg:gap-x-6">
      <div className="flex items-baseline justify-between gap-4 lg:block">
        <div>
          <h3 id={`${id}-heading`} className="text-lg font-semibold tracking-tight">
            <Link href={href} className="underline-offset-4 hover:underline">
              {title}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted">{intro}</p>
        </div>
        <Link
          href={href}
          aria-label={`See all of ${title}`}
          className="shrink-0 text-sm text-muted transition-colors hover:text-foreground lg:mt-3 lg:inline-block"
        >
          See all <span aria-hidden>→</span>
        </Link>
      </div>

      <ul className="-mx-6 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:mt-0">
        {previews.map((p) => (
          <Tile key={p.key} preview={p} fallbackHref={href} />
        ))}
      </ul>
    </section>
  );
}

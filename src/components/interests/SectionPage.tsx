import Link from "next/link";
import type { ReactNode } from "react";
import JumpLinks from "@/components/JumpLinks";
import type { InterestSection } from "./sections";

/** The frame of a full interest page: back link, title, intro, jump links. */
export default function SectionPage({
  section,
  subsections,
  children,
}: {
  section: InterestSection;
  /** Subsections actually shown; jump links appear when there are 2+. */
  subsections: { id: string; label: string }[];
  children: ReactNode;
}) {
  const { title, icon: Icon, intro } = section;

  return (
    <div>
      <Link
        href="/interests"
        className="text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        ← Interests
      </Link>
      <h1 className="mt-6 flex items-center gap-3 text-3xl font-semibold tracking-tight">
        <Icon size={26} aria-hidden className="text-foreground/50" />
        {title}
      </h1>
      <p className="mt-2 max-w-md text-foreground/60">{intro}</p>
      {subsections.length > 1 && <JumpLinks links={subsections} />}
      {children}
    </div>
  );
}

/** A titled block on a full interest page; `id` is the jump-link target. */
export function Subsection({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-12 scroll-mt-8">
      <h2 id={`${id}-heading`} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {intro && <p className="mt-1 text-sm text-foreground/60">{intro}</p>}
      {children}
    </section>
  );
}

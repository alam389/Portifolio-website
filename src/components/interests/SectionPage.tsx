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
  /** Subsections actually shown; jump links appear when there are 3+. */
  subsections: { id: string; label: string }[];
  children: ReactNode;
}) {
  const { title, intro } = section;

  return (
    <div>
      <Link
        href="/interests"
        className="text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        ← Interests
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-foreground/60">{intro}</p>
      {/* Two short subsections are a glance apart; links only pay off at 3+. */}
      {subsections.length > 2 && <JumpLinks links={subsections} />}
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
      {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      {children}
    </section>
  );
}

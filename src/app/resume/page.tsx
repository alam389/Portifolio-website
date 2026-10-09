import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Resume | Anthony Lam" };

const linkClass =
  "inline-flex items-center gap-1.5 rounded-md border border-foreground/20 px-3 py-1.5 text-sm transition-colors hover:border-foreground/50";

// Back-link targets by `?from=`; anything else returns to About.
const BACK = {
  experience: { href: "/experience", label: "Experience" },
} as const;

export default async function Resume({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const back =
    from && from in BACK ? BACK[from as keyof typeof BACK] : { href: "/", label: "About" };

  return (
    <section>
      <Link
        href={back.href}
        className="text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        ← {back.label}
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/20 pb-2">
        <h1 className="text-3xl font-semibold tracking-tight">Resume</h1>
        <div className="flex flex-wrap gap-2 pb-1">
          <a href="/api/resume?view" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Open in new tab <span aria-hidden>↗</span>
          </a>
          <a href="/api/resume" className={linkClass}>
            Download <span aria-hidden>↓</span>
          </a>
        </div>
      </div>
      {/* Mobile browsers often can't render PDFs inline; the buttons above
          cover that case. */}
      <iframe
        src="/api/resume?view#view=FitH"
        title="Anthony Lam's resume"
        className="mt-6 aspect-[8.5/11] w-full rounded-md border border-foreground/20 bg-white"
      />
    </section>
  );
}

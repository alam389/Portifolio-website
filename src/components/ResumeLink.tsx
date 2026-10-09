import Link from "next/link";

const linkClass =
  "inline-flex items-center gap-1.5 rounded-md border border-foreground/20 px-3 py-1.5 text-sm transition-colors hover:border-foreground/50";

/** `from` is where /resume's back link returns to (see BACK in resume/page.tsx). */
export default function ResumeLink({
  className = "",
  from,
}: {
  className?: string;
  from?: "experience";
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Link href={from ? `/resume?from=${from}` : "/resume"} className={linkClass}>
        View resume <span aria-hidden>→</span>
      </Link>
      <a href="/api/resume" className={linkClass}>
        Download <span aria-hidden>↓</span>
      </a>
    </div>
  );
}

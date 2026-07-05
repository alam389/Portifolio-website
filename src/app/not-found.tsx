import Link from "next/link";

// 404 styled as an editor "file not found" (DESIGN.md §2.2). Renders inside
// the root layout, so the sidebar/tab chrome stays up.

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center font-mono">
      <pre className="rounded-lg border border-border bg-code-bg px-5 py-4 text-left text-sm text-muted">
        {`ENOENT: no such file or directory\n  the file you're looking for isn't in this workspace`}
      </pre>
      <Link
        href="/"
        className="text-sm text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
      >
        Open about.md →
      </Link>
    </div>
  );
}

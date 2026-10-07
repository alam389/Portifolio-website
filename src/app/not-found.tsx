import Link from "next/link";

// Null Island: the point at 0°, 0° where bad coordinates end up on a map.
// Fits the Journey globe, and every broken link really does land "nowhere".
export default function NotFound() {
  return (
    <div className="flex min-h-[60svh] flex-col justify-center">
      <p className="font-mono text-sm text-foreground/50">404 · 0.0000° N, 0.0000° E</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        You&apos;ve washed up on Null Island.
      </h1>
      <p className="mt-2 max-w-md text-foreground/60">
        This is where maps send coordinates that don&apos;t exist. The page
        you&apos;re after isn&apos;t here either.
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground">
          ← Back to About
        </Link>
        <Link
          href="/journey"
          className="text-foreground/60 transition-colors hover:text-foreground"
        >
          See where I&apos;ve actually been →
        </Link>
      </div>
    </div>
  );
}

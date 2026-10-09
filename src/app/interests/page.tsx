import type { Metadata } from "next";
import InterestCard from "@/components/interests/InterestCard";
import { hasContent, interestSections } from "@/components/interests/sections";

export const metadata: Metadata = { title: "Interests | Anthony Lam" };

export default function Interests() {
  // Sections with nothing live (all drafts, in production) drop out.
  const shown = interestSections.filter(hasContent);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Interests</h1>
      <p className="mt-2 max-w-md text-foreground/60">
        What I&apos;m into when I&apos;m not working.
      </p>

      {shown.length > 0 ? (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {shown.map((s) => (
            <InterestCard key={s.id} section={s} />
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-foreground/50">More here soon.</p>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import SectionGallery from "@/components/interests/SectionGallery";
import SectionPreview from "@/components/interests/SectionPreview";
import { hasContent, interestSections } from "@/components/interests/sections";
import { interestIntros } from "@/data";

export const metadata: Metadata = { title: "Interests | Anthony Lam" };

export default function Interests() {
  // Sections with nothing live (all drafts, in production) drop out.
  const shown = interestSections.filter(hasContent);
  const reading = shown.filter((s) => s.layout === "index");
  const hobbies = shown.filter((s) => s.layout === "gallery");
  // A lone section gets a longer preview, so the overview isn't just a doorway.
  const max = shown.length === 1 ? 5 : 3;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Interests</h1>
      <p className="mt-2 max-w-md text-foreground/60">{interestIntros.overview}</p>

      {shown.length === 0 && <p className="mt-8 text-sm text-muted">More here soon.</p>}

      {reading.map((s) => (
        <SectionPreview key={s.id} section={s} max={max} />
      ))}

      {hobbies.length > 0 && (
        <section aria-labelledby="hobbies-heading" className="mt-20">
          <h2 id="hobbies-heading" className="text-2xl font-semibold tracking-tight">
            Hobbies
          </h2>
          {hobbies.map((s) => (
            <SectionGallery key={s.id} section={s} />
          ))}
        </section>
      )}
    </div>
  );
}

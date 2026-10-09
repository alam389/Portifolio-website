import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityCard, live } from "@/components/interests/Items";
import SectionPage from "@/components/interests/SectionPage";
import { getSection } from "@/components/interests/sections";
import { activities } from "@/data";

export const metadata: Metadata = { title: "Active | Anthony Lam" };

export default function ActivePage() {
  const section = getSection("active");
  const shown = live(activities);
  if (shown.length === 0) notFound();

  return (
    <SectionPage section={section} subsections={[]}>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {shown.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </ul>
    </SectionPage>
  );
}

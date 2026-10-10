import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Pet lab", robots: { index: false } };

// Review page for the pet sprites; development only. The lab is imported after
// the check so it stays out of this route's code in production.
export default async function PetLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const { default: PetLab } = await import("@/components/pet/PetLab");
  return <PetLab />;
}

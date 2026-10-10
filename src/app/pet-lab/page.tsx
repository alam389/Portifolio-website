import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PetLab from "@/components/pet/PetLab";

export const metadata: Metadata = { title: "Pet lab", robots: { index: false } };

// Review page for the pet sprites; never shipped.
export default function PetLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PetLab />;
}

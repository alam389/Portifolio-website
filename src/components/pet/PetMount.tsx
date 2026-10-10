"use client";

import dynamic from "next/dynamic";
import { usePetPreference } from "./preferences";

// The pet is pure decoration: load it after the page, never on the server.
const Pet = dynamic(() => import("./Pet"), { ssr: false });

export default function PetMount() {
  const { species, coat, enabled } = usePetPreference();
  return enabled ? <Pet species={species} coat={coat} /> : null;
}

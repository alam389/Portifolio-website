"use client";

import dynamic from "next/dynamic";
import { usePetPreference } from "./preferences";

// The pet is pure decoration: load it after the page, never on the server.
const Pet = dynamic(() => import("./Pet"), { ssr: false });

export default function PetMount() {
  const { species, coat, enabled, talk } = usePetPreference();
  // Keyed so a new species or coat drops in fresh.
  return enabled ? <Pet key={`${species}-${coat}`} species={species} coat={coat} talk={talk} /> : null;
}

"use client";

import dynamic from "next/dynamic";
import { usePetSettings } from "./settings";

// The pet is pure decoration: load it after the page, never on the server.
const Pet = dynamic(() => import("./Pet"), { ssr: false });

export default function PetMount() {
  const { species, coat, hidden, talk } = usePetSettings();
  // Keyed so a new species or coat drops in fresh.
  return hidden ? null : <Pet key={`${species}-${coat}`} species={species} coat={coat} talk={talk} />;
}

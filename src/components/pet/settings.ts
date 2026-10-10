import { useSyncExternalStore } from "react";
import { SPECIES, SPECIES_NAMES, variantsOf, type SpeciesName } from "./sprites";

/**
 * The visitor's pet choice: species, coat, whether it's hidden and whether it talks. Remembered
 * in localStorage (best effort) and shared by the pet and the paw menu.
 */
export interface PetSettings {
  species: SpeciesName;
  coat: string;
  hidden: boolean;
  /** Whether it speaks in bubbles. */
  talk: boolean;
}

const KEY = "pet";
const DEFAULT: PetSettings = { species: "cat", coat: variantsOf("cat")[0][0], hidden: false, talk: true };

const listeners = new Set<() => void>();
let current: PetSettings | null = null;

function valid(s: Partial<PetSettings> | null): PetSettings {
  const species = SPECIES_NAMES.find((n) => n === s?.species) ?? DEFAULT.species;
  const coat =
    s?.coat && s.coat in SPECIES[species].variants ? s.coat : variantsOf(species)[0][0];
  return { species, coat, hidden: s?.hidden === true, talk: s?.talk !== false };
}

function read(): PetSettings {
  if (current) return current;
  try {
    current = valid(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {
    current = DEFAULT;
  }
  return current;
}

export function updatePet(patch: Partial<PetSettings>) {
  const next = { ...read(), ...patch };
  // A new species starts on its default coat unless one was given.
  if (patch.species && !patch.coat) next.coat = variantsOf(patch.species)[0][0];
  current = valid(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Storage blocked: the choice still applies, it just won't be remembered.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Server render and first paint use the default; the saved choice follows. */
export function usePetSettings() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}

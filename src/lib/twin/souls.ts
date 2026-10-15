import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SpeciesName } from "@/components/pet/sprites";

// Server only: each pet's soul (src/components/pet/souls/<species>.md), so
// the answer model can write the pet's aside in its voice. next.config.ts
// traces the files into the /api/chat deployment.

/** The pets with a soul; checked against SPECIES_NAMES in souls.test.ts. */
export const PETS = ["cat", "dog", "bunny"] as const satisfies readonly SpeciesName[];
export type Pet = (typeof PETS)[number];

export const isPet = (value: unknown): value is Pet => PETS.includes(value as Pet);

const cache = new Map<Pet, string | null>();

/** The pet's soul, or null if the file can't be read (then the bubble uses its fixed asides). */
export function soulOf(pet: Pet): string | null {
  if (!cache.has(pet)) {
    try {
      cache.set(pet, readFileSync(join(process.cwd(), "src/components/pet/souls", `${pet}.md`), "utf8"));
    } catch (err) {
      console.error("[twin] soul unreadable", pet, err);
      cache.set(pet, null);
    }
  }
  return cache.get(pet) ?? null;
}

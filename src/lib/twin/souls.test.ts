import { describe, expect, it } from "vitest";
import { SPECIES_NAMES } from "@/components/pet/sprites";
import { PETS, soulOf } from "./souls";

describe("souls", () => {
  it("covers every species", () => {
    expect([...PETS].sort()).toEqual([...SPECIES_NAMES].sort());
  });

  it("reads each pet's soul", () => {
    for (const pet of PETS) expect(soulOf(pet)).toMatch(/## Voice/);
  });
});

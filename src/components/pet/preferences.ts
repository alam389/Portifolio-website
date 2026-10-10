import { useSyncExternalStore } from "react";
import { SPECIES, SPECIES_NAMES, defaultCoat, type SpeciesName } from "./sprites";

export interface PetPreference {
  species: SpeciesName;
  coat: string;
  enabled: boolean;
}

const KEY = "pet";
const FALLBACK: PetPreference = { species: "cat", coat: defaultCoat("cat"), enabled: true };

/** Reject anything that isn't a known species and one of its coats. */
function valid(species: unknown, coat: unknown): { species: SpeciesName; coat: string } | null {
  const s = SPECIES_NAMES.find((n) => n === species);
  if (!s) return null;
  return typeof coat === "string" && coat in SPECIES[s].variants ? { species: s, coat } : { species: s, coat: defaultCoat(s) };
}

function parse(raw: string | null): PetPreference {
  try {
    const saved = raw ? JSON.parse(raw) : null;
    const pick = valid(saved?.species, saved?.coat);
    return { ...FALLBACK, ...pick, enabled: saved?.enabled !== false };
  } catch {
    return FALLBACK;
  }
}

// Where the choice lives when storage is blocked, so it still applies this visit.
let memory: string | null = null;

function read(): string | null {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

// ?pet=dog&coat=black overrides the saved choice, for demos and links.
function withUrl(pref: PetPreference): PetPreference {
  const params = new URLSearchParams(location.search);
  const pick = valid(params.get("pet"), params.get("coat"));
  return pick ? { ...pref, ...pick, enabled: true } : pref;
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// useSyncExternalStore needs a stable snapshot until something changes.
let cache: { key: string; value: PetPreference } | null = null;
function snapshot(): PetPreference {
  const raw = read();
  const key = `${raw}|${location.search}`;
  if (cache?.key !== key) cache = { key, value: withUrl(parse(raw)) };
  return cache.value;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    removeEventListener("storage", onChange);
  };
}

/** The visitor's pet: species, coat and whether it's shown. Defaults to the cat. */
export function usePetPreference(): PetPreference {
  return useSyncExternalStore(subscribe, snapshot, () => FALLBACK);
}

/** Save a change; every mounted `usePetPreference` updates. */
export function setPetPreference(change: Partial<PetPreference>) {
  const next = { ...parse(read()), ...change };
  const pick = valid(next.species, next.coat) ?? FALLBACK;
  memory = JSON.stringify({ ...next, ...pick });
  try {
    localStorage.setItem(KEY, memory);
  } catch {
    // Storage blocked: the choice just won't outlive this page.
  }
  emit();
}

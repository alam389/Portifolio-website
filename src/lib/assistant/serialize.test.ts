import { describe, expect, it } from "vitest";
import { activities, experiences, journey, profile, projects, assistant } from "@/data";
import { SECTION_IDS, serialize } from "./serialize";

const sections = serialize();
const all = Object.values(sections).join("\n");

describe("serialize", () => {
  it("returns every section", () => {
    expect(Object.keys(sections).sort()).toEqual([...SECTION_IDS].sort());
  });

  it("never includes draft entries", () => {
    for (const stop of journey.filter((s) => s.draft)) expect(sections.journey).not.toContain(stop.title);
    for (const a of activities.filter((a) => a.draft)) expect(all).not.toContain(a.description);
    for (const f of assistant.facts.filter((f) => f.draft)) expect(all).not.toContain(f.question);
    expect(all).not.toContain("Placeholder");
  });

  it("prefers first-person details over highlights", () => {
    const withDetails = experiences.find((e) => e.details?.length);
    if (!withDetails) return;
    expect(sections.experience).toContain(withDetails.details![0].story[0]);
    expect(sections.experience).not.toContain(withDetails.highlights[0]);
  });

  it("prefers a project's story over its card description", () => {
    for (const p of projects) {
      if (p.story?.length) {
        expect(sections.projects).toContain(p.story[0]);
        expect(sections.projects).not.toContain(p.description);
      } else {
        expect(sections.projects).toContain(p.description);
      }
    }
  });

  it("includes contact details in the profile", () => {
    expect(sections.profile).toContain(profile.email);
  });
});

import { describe, expect, it } from "vitest";
import { referrerDomain, utmSource } from "./visit";

describe("referrerDomain", () => {
  it("keeps only the domain, without www", () => {
    expect(referrerDomain("https://www.linkedin.com/in/someone/?trk=abc", "anthonys-portfolio.com")).toBe(
      "linkedin.com",
    );
  });

  it("ignores direct visits, junk and this site", () => {
    expect(referrerDomain("", "anthonys-portfolio.com")).toBeNull();
    expect(referrerDomain("not a url", "anthonys-portfolio.com")).toBeNull();
    expect(referrerDomain("https://www.anthonys-portfolio.com/projects", "anthonys-portfolio.com")).toBeNull();
  });
});

describe("utmSource", () => {
  it("reads a plain utm_source", () => {
    expect(utmSource("?utm_source=Resume&utm_medium=pdf")).toBe("resume");
  });

  it("drops anything that isn't a plain token", () => {
    expect(utmSource("")).toBeNull();
    expect(utmSource("?utm_source=<script>")).toBeNull();
    expect(utmSource(`?utm_source=${"a".repeat(60)}`)).toBeNull();
  });
});

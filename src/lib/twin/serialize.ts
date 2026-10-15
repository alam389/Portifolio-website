import {
  activities,
  books,
  dishes,
  experiences,
  journey,
  papers,
  podcasts,
  profile,
  projects,
  projectStatusLabel,
  restaurants,
  skills,
  twin,
  volunteering,
  type Experience,
  type Project,
} from "@/data";

// The twin's view of src/data: each section as plain text for the answer
// model. Drafts never reach it, in dev or production, so the twin says it
// doesn't know rather than repeating a placeholder.

export const SECTION_IDS = [
  "profile",
  "experience",
  "projects",
  "journey",
  "interests",
  "faqs",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** What each section covers, for the router question that decides whether to include it. */
export const SECTION_SCOPE: Record<SectionId, string> = {
  profile:
    "who Anthony is, his current role, education, GPA, coursework, awards, skills, contact details and what he's focused on now",
  experience:
    "Anthony's jobs, internships, co-ops, volunteering and leadership roles, and the work he did in them",
  projects: "Anthony's software projects, how they were built, and this portfolio website",
  journey: "where Anthony has lived, studied, worked and travelled, and when",
  interests: "the papers, books and podcasts Anthony follows, what he cooks and eats, and how he stays active",
  faqs: "whether Anthony is open to roles, what work he wants, relocation or remote work, his favourite stack and how he works on a team",
};

const live = <T extends { draft?: string }>(entries: T[]) => entries.filter((e) => !e.draft);

/** Joins the lines that exist; falsy entries (unset optional fields) drop out. */
const lines = (...parts: (string | false | undefined | null)[]) => parts.filter(Boolean).join("\n");

function experience(e: Experience, depth = 0): string {
  const heading = `${"#".repeat(depth + 3)} ${e.title}, ${e.company} (${e.period}, ${e.location})`;
  // Prefer the first-person accounts; they cover the highlights in more depth.
  const body = e.details?.length
    ? e.details.map((d) => lines(`${d.title}:`, ...d.story)).join("\n\n")
    : e.highlights.map((h) => `- ${h}`).join("\n");
  const subroles = e.subroles?.map((s) => experience(s, depth + 1)) ?? [];
  return [heading, body, ...subroles].filter(Boolean).join("\n");
}

function project(p: Project): string {
  return lines(
    `### ${p.title}: ${p.tagline}`,
    `Status: ${projectStatusLabel[p.status]}${p.period ? ` · ${p.period}` : ""}`,
    `Tech: ${p.technologies.join(", ")}`,
    p.github && `GitHub: ${p.github}`,
    p.live && `Live: ${p.live}`,
    p.architecture && `Page with architecture diagram: /projects/${p.id}`,
    ...(p.story?.length ? p.story : [p.description]),
    ...(p.decisions ?? []).map(
      (d) => `Decision: ${d.title}. Why: ${d.context} What: ${d.decision} Trade-offs: ${d.consequences}`,
    ),
  );
}

function profileSection(): string {
  const { education: ed } = profile;
  return lines(
    `## Profile`,
    `Name: ${profile.name}`,
    `Role: ${profile.role}`,
    `Based in: ${profile.location}`,
    `Email: ${profile.email}`,
    profile.availability && `Availability: ${profile.availability}`,
    ...profile.socials.filter((s) => s.label !== "Email").map((s) => `${s.label}: ${s.href}`),
    "",
    ...profile.summary,
    "",
    `### Education`,
    `${ed.degree}, ${ed.school} (${ed.period}), GPA ${ed.gpa}`,
    `Coursework: ${ed.coursework.join(", ")}`,
    ...ed.awards.map((a) => `- ${a.title} (${a.issuer}, ${a.date}): ${a.description}`),
    "",
    `### Skills`,
    ...skills.map((g) => `${g.label}: ${g.items.join(", ")}`),
    "",
    `### Selected work`,
    ...profile.selectedWork.map((w) => `- ${w.title} (${w.context}): ${w.outcome}`),
    "",
    `### Now (as of ${profile.now.updated})`,
    ...profile.now.items.map((i) => `- ${i}`),
  );
}

function experienceSection(): string {
  return [
    "## Experience",
    ...experiences.map((e) => experience(e)),
    "## Volunteering and leadership",
    ...volunteering.map((e) => experience(e)),
  ].join("\n\n");
}

function projectsSection(): string {
  return ["## Projects", ...projects.map(project)].join("\n\n");
}

function journeySection(): string {
  return [
    "## Journey (in order)",
    ...live(journey).map((s) =>
      lines(`- ${s.date}, ${s.place}: ${s.title}${s.now ? " (now)" : ""}`, s.description && `  ${s.description}`),
    ),
  ].join("\n");
}

function interestsSection(): string {
  const parts = [
    "## Interests",
    "### Papers",
    ...live(papers).map((p) =>
      lines(
        `- ${p.title} (${p.authors}, ${p.year}${p.venue ? `, ${p.venue}` : ""})`,
        p.takeaway && `  My takeaway: ${p.takeaway}`,
        p.summary && `  What it's about: ${p.summary.overview}`,
      ),
    ),
    "### Books",
    ...live(books).map((b) =>
      lines(`- ${b.title} by ${b.authors} (${b.year})`, b.takeaway && `  My takeaway: ${b.takeaway}`),
    ),
    "### Podcasts",
    ...live(podcasts).map((p) =>
      lines(
        `- ${p.show}${p.episode ? `: ${p.episode}` : ""}`,
        p.about && `  About: ${p.about}`,
        p.takeaway && `  How I use it: ${p.takeaway}`,
      ),
    ),
  ];
  const cooking = live(dishes);
  if (cooking.length) parts.push("### What I cook", ...cooking.map((d) => `- ${d.name}${d.note ? `: ${d.note}` : ""}`));
  const eating = live(restaurants);
  if (eating.length)
    parts.push("### Where I eat", ...eating.map((r) => `- ${r.name}, ${r.city} (${r.cuisine}): I order ${r.order}`));
  const active = live(activities);
  if (active.length)
    parts.push(
      "### Staying active",
      ...active.map((a) =>
        lines(
          `- ${a.title}: ${a.description}`,
          a.facts.length > 0 && `  ${a.facts.join(" · ")}`,
          !!a.prs?.length && `  PRs: ${a.prs.map((pr) => `${pr.label} ${pr.value}`).join(", ")}`,
        ),
      ),
    );
  return parts.join("\n");
}

function faqsSection(): string {
  const facts = live(twin.facts);
  if (!facts.length) return "";
  return ["## Questions I get asked", ...facts.map((f) => `Q: ${f.question}\nA: ${f.answer}`)].join("\n\n");
}

const build: Record<SectionId, () => string> = {
  profile: profileSection,
  experience: experienceSection,
  projects: projectsSection,
  journey: journeySection,
  interests: interestsSection,
  faqs: faqsSection,
};

/** Every section as text. Empty sections (nothing live yet) come back as "". */
export function serialize(): Record<SectionId, string> {
  return Object.fromEntries(SECTION_IDS.map((id) => [id, build[id]()])) as Record<SectionId, string>;
}

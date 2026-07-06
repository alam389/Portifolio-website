import { profile } from "./profile";

// Pregenerated agent knowledge base (no live model — and we say so).
// Every answer is composed from real data in src/data. Adding an entry =
// one object here; the Chat matches free-text input against `triggers`.

export type BlockType =
  | "skills"
  | "projects"
  | "experience"
  | "contact"
  | "resume";

export interface AgentEntry {
  id: string;
  /** Short label for the command bar. */
  label: string;
  /** The canonical question shown as the user message. */
  question: string;
  /** Show as a quick-question chip on the hero. */
  chip?: boolean;
  /** Lowercase keywords matched against free-text input. */
  triggers: string[];
  /** Streamed intro text. */
  text: string;
  /** Optional structured block rendered after the text. */
  block?: BlockType;
}

/** Project card data — derived server-side from the IDE pages' frontmatter. */
export interface ProjectLink {
  slug: string;
  title: string;
  description: string;
}

export const ENTRIES: AgentEntry[] = [
  {
    id: "me",
    label: "Me",
    question: "Who are you?",
    chip: true,
    triggers: ["who", "about", "yourself", "anthony", "intro", "student"],
    text: `${profile.hero[0]} ${profile.about[0]}`,
  },
  {
    id: "skills",
    label: "Skills",
    question: "What are your skills?",
    chip: true,
    triggers: ["skill", "stack", "tech", "language", "framework", "tool"],
    text: "I don't stick to one stack — here's what I work with day to day:",
    block: "skills",
  },
  {
    id: "projects",
    label: "Projects",
    question: "What projects are you most proud of?",
    chip: true,
    triggers: ["project", "proud", "built", "build", "portfolio", "athena", "kiyoko"],
    text: "A few favorites — each card opens the full write-up in the editor:",
    block: "projects",
  },
  {
    id: "experience",
    label: "Experience",
    question: "What's your work experience?",
    triggers: ["experience", "job", "work", "intern", "career", "mcgregor", "employ"],
    text: "The short version — most recent first:",
    block: "experience",
  },
  {
    id: "contact",
    label: "Contact",
    question: "How can I reach Anthony?",
    triggers: ["contact", "email", "reach", "hire", "linkedin", "github", "touch", "talk"],
    text: profile.contactBlurb,
    block: "contact",
  },
  {
    id: "resume",
    label: "Resume",
    question: "Can I see your resume?",
    triggers: ["resume", "cv", "pdf"],
    text: "Working on it —",
    block: "resume",
  },
];

export const FALLBACK: AgentEntry = {
  id: "fallback",
  label: "?",
  question: "",
  triggers: [],
  text: "Honest answer: I'm a pregenerated twin — there's no live model behind me (yet), so I can only answer what Anthony wrote down. Try a quick question or one of the buttons below.",
};

export function matchEntry(input: string): AgentEntry {
  const q = input.toLowerCase();
  return ENTRIES.find((e) => e.triggers.some((t) => q.includes(t))) ?? FALLBACK;
}

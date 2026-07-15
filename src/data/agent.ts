import { profile, experiences, projects, skills } from "@/data";

// Pregenerated knowledge base for the digital twin (DESIGN.md: static grounding,
// no live model yet). Every answer is composed from real src/data — the twin
// never invents facts. Swapping in the live /api/chat is one seam in Twin.tsx.

export type BlockType =
  | "skills"
  | "projects"
  | "experience"
  | "contact"
  | "resume";

export interface AgentEntry {
  id: string;
  /** Short label for the command row. */
  label: string;
  /** Canonical question shown as the user's message. */
  question: string;
  /** Surface as a quick-question chip on the intro screen. */
  chip?: boolean;
  /** Lowercase keywords matched against free-text input. */
  triggers: string[];
  /** Streamed intro text (real content from src/data). */
  text: string;
  /** Optional structured block rendered after the text. */
  block?: BlockType;
}

const firstName = profile.name.split(" ")[0];

export const ENTRIES: AgentEntry[] = [
  {
    id: "me",
    label: "Me",
    question: "Who are you?",
    chip: true,
    triggers: ["who", "about", "yourself", "you", "intro", "bio", "student", "anthony"],
    text:
      "I'm Anthony Lam — a fourth-year Software Engineering student at Western University and a part-time Software Developer at McGregor Allsop. I love the whole craft: designing systems, building full-stack apps, and picking up new technologies to solve real problems. I don't marry a single stack — I'm always chasing the next thing worth learning.",
  },
  {
    id: "skills",
    label: "Skills",
    question: "What's your tech stack?",
    chip: true,
    triggers: ["skill", "stack", "tech", "language", "framework", "tool", "know"],
    text: "Here's what I reach for, grouped by where it sits in the stack:",
    block: "skills",
  },
  {
    id: "projects",
    label: "Projects",
    question: "What projects are you most proud of?",
    chip: true,
    triggers: ["project", "proud", "built", "build", "portfolio", "made", "app", "hack"],
    text: `A few favorites out of ${projects.length} — from cloud infrastructure to hackathon wins:`,
    block: "projects",
  },
  {
    id: "experience",
    label: "Experience",
    question: "What's your work experience?",
    triggers: ["experience", "job", "work", "intern", "career", "employ", "mcgregor", "lead"],
    text: "Most recent first — real roles, real impact:",
    block: "experience",
  },
  {
    id: "contact",
    label: "Contact",
    question: `How can I reach ${firstName}?`,
    chip: false,
    triggers: ["contact", "email", "reach", "hire", "linkedin", "github", "touch", "talk", "connect"],
    text: profile.contactBlurb.replace("questions for want advice", "questions, want advice"),
    block: "contact",
  },
  {
    id: "resume",
    label: "Resume",
    question: "Can I see your resume?",
    triggers: ["resume", "cv", "pdf", "download"],
    text: "Happy to share —",
    block: "resume",
  },
];

export const FALLBACK: AgentEntry = {
  id: "fallback",
  label: "?",
  question: "",
  triggers: [],
  text: `Straight answer: I'm a pregenerated twin — there's no live model behind me yet, so I can only speak to what ${firstName} has written down. Try one of the buttons below, or ask about my skills, projects, experience, or how to get in touch.`,
};

/** Pregenerated matcher. The live-model seam replaces this call in Twin.tsx. */
export function matchEntry(input: string): AgentEntry {
  const q = input.toLowerCase();
  return (
    ENTRIES.find((e) => e.triggers.some((t) => q.includes(t))) ?? FALLBACK
  );
}

// Re-exported so answer cards render straight from the typed content layer.
export { profile, experiences, projects, skills };

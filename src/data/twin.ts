import type { Twin } from "./types";

const MOCK = "Placeholder. Write the real answer or delete.";

// What the AI twin knows beyond the rest of src/data. Questions are common
// ones visitors ask; the answers are Anthony's to write. Draft entries are
// dropped in production, so the twin says it doesn't know instead.

export const twin: Twin = {
  voice: [],
  offLimits: [],
  facts: [
    {
      id: "open-to-roles",
      question: "Are you open to new roles?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "role-type",
      question: "What kind of work are you looking for?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "relocation",
      question: "Are you open to relocating or remote work?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "favourite-stack",
      question: "What's your favourite stack to work in?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "how-you-work",
      question: "How do you like to work on a team?",
      answer: "",
      draft: MOCK,
    },
  ],
};

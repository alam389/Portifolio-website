import type { Assistant } from "./types";

const MOCK = "Placeholder. Write the real answer or delete.";

// What the AI assistant knows beyond the rest of src/data. Questions are common
// ones visitors ask; the answers are Anthony's to write. Draft entries are
// dropped in production, so the assistant says it doesn't know instead.

export const assistant: Assistant = {
  greeting:
    "Hi, I'm Anthony's assistant. I know his work, projects and story from this site. Ask me anything about him.",
  starters: [
    "What did Anthony build at McGregor-Allsop?",
    "What is he working on right now?",
    "How did he build this site?",
  ],
  privacyNote: "Chats are saved so Anthony can improve the assistant.",
  voice: [],
  offLimits: [],
  facts: [
    {
      id: "open-to-roles",
      question: "Is Anthony open to new roles?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "role-type",
      question: "What kind of work is he looking for?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "relocation",
      question: "Is he open to relocating or remote work?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "favourite-stack",
      question: "What's his favourite stack to work in?",
      answer: "",
      draft: MOCK,
    },
    {
      id: "how-you-work",
      question: "How does he like to work on a team?",
      answer: "",
      draft: MOCK,
    },
  ],
};

import type { Profile, SkillGroup } from "./types";

export const profile: Profile = {
  name: "Anthony Lam",
  role: "Software Engineer",
  location: "London, ON",
  email: "lamanthony167@gmail.com",
  // TODO: rewrite in your own voice; this is drafted from the resume.
  summary: [
    "I'm a software engineering student at Western University building AI products: retrieval pipelines, RAG assistants and the apps around them.",
    "Recently that's meant a beauty-recommendation assistant on Shopify at Kiyoko Beauty, a Graph-RAG ingestion pipeline at McGregor-Allsop, and Mneme, my own document-to-memory service.",
  ],
  education: {
    school: "University of Western Ontario",
    degree: "BASc Software Engineering",
    period: "Sept 2022 – Present",
    gpa: "3.7",
    coursework: [
      "Multi-Agent Architecture",
      "Data Structures and Algorithms",
      "Cloud Computing",
      "Applications of AI & Software",
    ],
  },
  socials: [
    { label: "GitHub", href: "https://github.com/alam389" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/anthony-lam/" },
    { label: "Email", href: "mailto:lamanthony167@gmail.com" },
  ],
};

export const skills: SkillGroup[] = [
  {
    label: "Languages",
    items: ["Java", "Python", "TypeScript", "JavaScript", "SQL", "Go"],
  },
  {
    label: "AI & Automation",
    items: ["Neo4j", "Pinecone", "LangChain", "LangGraph", "Hugging Face", "Docker"],
  },
  {
    label: "Developer Tools",
    items: ["Google AI Studio", "IntelliJ", "VS Code", "Claude Code"],
  },
];

import type { Skill } from "./types";

// Icon slugs map to react-icons (Si*/Fa*) used previously; rewire in the UI.
// `category` groups them for the twin's skills answer (Languages / Frameworks / Tools).
export const skills: Skill[] = [
  { name: "JavaScript", icon: "javascript", color: "#F7DF1E", category: "language" },
  { name: "TypeScript", icon: "typescript", color: "#3178C6", category: "language" },
  { name: "Java", icon: "java", color: "#ED8B00", category: "language" },
  { name: "SQL", icon: "database", color: "#4479A1", category: "language" },
  { name: "Spring Boot", icon: "spring", color: "#6DB33F", category: "framework" },
  { name: "Express.js", icon: "express", color: "#000000", category: "framework" },
  { name: "Next.js", icon: "nextdotjs", color: "#000000", category: "framework" },
  { name: "React", icon: "react", color: "#61DAFB", category: "framework" },
  { name: "Node.js", icon: "nodedotjs", color: "#339933", category: "framework" },
  { name: "Vite", icon: "vite", color: "#646CFF", category: "tool" },
  { name: "Neon PostgreSQL", icon: "postgresql", color: "#336791", category: "tool" },
  { name: "AWS", icon: "aws", color: "#FF9900", category: "tool" },
];

import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: 1,
    title: "Plan Catalyst Data Analytics Dashboard",
    description:
      "Designed and implemented cloud infrastructure to house data fetching and ML processing, using serverless services like API Gateway, ECS Fargate, and Lambda.",
    services: "CLOUD INFRASTRUCTURE / DATA / MACHINE LEARNING",
    technologies: ["AWS", "Python"],
    image: "/images/AWS-arch.png",
    github: "https://github.com/LlamzonAmazon/PC-Data-Dash",
  },
  {
    id: 2,
    title: "Fashion & Lifestyle Society Website",
    description:
      "A web app for Fashion & Lifestyle Society showcasing past fall/winter shows, news articles, and magazine issues. Built with React and Next.js.",
    services: "FRONTEND / UI/UX",
    technologies: ["React", "Next.js", "Tailwind CSS", "Figma"],
    image: "/images/FLS.png",
    github: "https://github.com/alam389/Fashion-and-Lifestyle-Society-Website",
    live: "https://fashion-lifestyle-society.vercel.app/",
  },
  {
    id: 4,
    title: "WoWie — Hack Western",
    description:
      "A browser extension that nudges women to start investing through mindful messages at the point of purchase on their favourite online stores.",
    services: "CHROME EXTENSION / UI/UX",
    technologies: ["Next.js", "Tailwind CSS", "Chrome Extension API"],
    image: "/images/Wowie.jpg",
    github: "https://github.com/sarahchiang0529/Hack-Western-XII.git",
  },
  {
    id: 5,
    title: "InternCompass — Hack The Valley",
    description:
      "An intelligent onboarding assistant that answers natural-language questions with accurate, cited answers pulled from company documents.",
    services: "FRONTEND / API INTEGRATION / UI/UX",
    technologies: ["React", "Next.js", "Tailwind CSS", "Gemini API"],
    image: "/images/InternCompass.png",
    github: "https://github.com/DanielChahine0/Intern-Compass",
    live: "https://devpost.com/software/intern-compass",
  },
  {
    id: 6,
    title: "EmpowHERto Mental Wellness App",
    description:
      "Led development of a platform supporting a 12-week mental-health program for teenage girls — auth, personalized dashboards, curriculum tracking, and team profiles.",
    services: "FULL-STACK / UI/UX",
    technologies: ["Express.js", "Next.js", "Neon PostgreSQL"],
    image: "/images/empBracedash.png",
  },
  {
    id: 7,
    title: "Let Me Pass — Password Manager",
    description:
      "My first personal project: a password manager with SHA-256 storage and a secure password generator. Built with Angular and Express.js.",
    date: "Winter 2024",
    services: "FULL-STACK",
    technologies: ["Angular", "Node.js", "Express.js"],
    image: "/images/let-me-pass.png",
    github: "https://github.com/alam389/let-me-pass-client.git",
    live: "https://let-me-pass-client.vercel.app/",
  },
];

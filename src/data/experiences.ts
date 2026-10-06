import type { Experience } from "./types";

export const experiences: Experience[] = [
  {
    id: "kiyoko",
    title: "Software Engineer (Intern)",
    company: "Kiyoko Beauty",
    location: "Remote",
    period: "May 2026 – Present",
    highlights: [
      "Helped launch a beauty AI assistant on Shopify that recommends products based on a user's skin concerns; 20% of conversations ended in an add-to-cart across 1000+ beta sessions.",
      "Developed retrieval pipelines across Vertex AI Vector, Gemini embeddings and related infrastructure content to support accurate Q&A for technical requirements and compliance criteria.",
      "Building a mobile app for skincare routines with any products, using React Native and Supabase.",
    ],
  },
  {
    id: "mcgregor-allsop",
    title: "Software Developer (Co-op)",
    company: "McGregor-Allsop Limited",
    location: "North York, ON",
    period: "May 2025 – Apr 2026",
    highlights: [
      "Developed an ERP web application to streamline annual reviews, project management and employee information, cutting $6,000 in SaaS products.",
      "Architected a Graph-RAG ingestion pipeline that semantically indexes 10,000+ pages of engineering documents and answers up to 100x faster than manual file-server search.",
      "Built RFP automation workflows using RAG, the Claude API, Hugging Face embedding models and Chroma to generate grounded technical responses from IBM product documentation.",
    ],
  },
  {
    id: "plan-catalyst",
    title: "Project Manager",
    company: "Plan Catalyst",
    location: "Remote / Freelance",
    period: "Sept 2025 – Dec 2025",
    highlights: [
      "Led two engineering squads using SAFe Agile to deliver a database management system for Project SHARE.",
      "Managed scope, sprint planning, backlog priorities and task tracking in Jira across design, development and stakeholder teams.",
      "Conducted user testing, A/B testing and feedback analysis to drive usability improvements.",
    ],
  },
  {
    id: "bgc",
    title: "Team Lead",
    company: "Boys & Girls Club",
    location: "London, ON",
    period: "Sept 2024 – Jan 2025",
    highlights: [
      "Worked with the club to address a lack of visibility into user insights and analytics.",
      "Delivered a web analytics solution that let the organization track and analyze traffic from 1,000+ users for the first time.",
    ],
  },
];

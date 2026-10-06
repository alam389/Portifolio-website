import type { Project, ProjectStatus } from "./types";

export const projectStatusLabel: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  early: "Early stage",
  school: "School project",
};

export const projects: Project[] = [
  {
    id: "mneme",
    title: "Mneme",
    tagline: "Documents in, queryable memory out",
    description:
      "Turns PDFs, DOCX, PPTX, Markdown, HTML and OCR'd images into searchable memory: converts with Docling, chunks with heading context, embeds via OpenRouter and stores in Pinecone. One pipeline behind an HTTP API, a CLI and an MCP server for Claude Code. Early scaffold: the Neo4j graph layer, retrieval module and auth are not built yet.",
    status: "early",
    tags: ["AI", "RAG", "Backend"],
    period: "Aug 2026 – Present",
    technologies: ["Python", "FastAPI", "Docling", "OpenRouter", "Pinecone", "Neo4j", "MCP"],
  },
  {
    id: "lumi",
    title: "Project Lumi",
    tagline: "Beauty intelligence platform",
    description:
      "A free, retailer-neutral platform to help people find beauty products that fit their characteristics, routines and the real outcomes of people like them. Related to my work at Kiyoko Beauty.",
    status: "in-progress",
    tags: ["Mobile"],
    technologies: ["React Native", "Supabase"],
  },
  {
    id: "tsi-dashboard",
    title: "PlanCatalyst TSI Data Dashboard",
    tagline: "Country-level development-need dashboard",
    description:
      "A data platform for client PlanCatalyst: global sources are fetched, cleaned, scored on a 7-pillar / 28-indicator model and published as versioned JSON to Azure Blob, then rendered in a React choropleth embedded in their Wix site. I worked on the backend and infrastructure (data-source wiring, country resolver, projections module, publish step) in May–June 2026.",
    status: "in-progress",
    tags: ["Data", "Backend", "Client work"],
    period: "May 2026 – Jun 2026 (my part)",
    technologies: ["Python", "React", "TypeScript", "d3", "Azure Blob", "GitHub Actions"],
    github: "https://github.com/PlanCatalyst/TSI-Data-Dashboard",
  },
  {
    id: "intern-compass",
    title: "Intern Compass",
    tagline: "Hack the Valley onboarding assistant",
    description:
      "An AI onboarding assistant: admins upload company PDFs, which are chunked and embedded; new hires ask questions in chat and Gemini answers with citations. I built the backend: admin routes, document deletion, vector embeddings for RAG and the Gemini query endpoint.",
    status: "shipped",
    tags: ["AI", "RAG", "Backend", "Hackathon"],
    period: "Oct 2025",
    technologies: ["Express", "TypeScript", "Postgres", "Gemini", "React"],
    github: "https://github.com/alam389/Inter-Compass-Service",
  },
  {
    id: "asl-digits",
    title: "ASL Digit Recognition",
    tagline: "CNN on webcam hand gestures",
    description:
      "A DATASCI 3000 group project that recognizes American Sign Language digits from images or a live webcam. The final version classifies 0 vs 1 with a SimpleCNN after a YOLOv8 hand crop, at about 130 ms per frame.",
    status: "school",
    tags: ["AI", "Computer Vision"],
    period: "Winter 2026",
    technologies: ["Python", "PyTorch", "YOLOv8", "OpenCV"],
    github: "https://github.com/JoshRay27/DataSci_3000_project",
  },
  {
    id: "pony-ai",
    title: "Pony AI",
    tagline: "Western capstone, source-cited student guide",
    description:
      "A capstone prototype for Team Pony Club: a RAG chatbot that helps Western students find official academic and campus-resource information, always cites its sources and refers personal or high-impact questions to the right office. Currently in planning.",
    status: "early",
    tags: ["AI", "RAG", "Capstone"],
    period: "Oct 2026 – Present",
    technologies: ["RAG"],
  },
];

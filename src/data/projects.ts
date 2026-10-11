import { media } from "./media";
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
    id: "wowie",
    title: "WoWie",
    tagline: "Hack Western 12 checkout nudge to invest",
    description:
      "A Chrome extension that meets women where they already shop: it reads the cart total at checkout and shows a playful \"Girl Math\" popup with what that money could be worth today had it gone into a stock, plus a \"Years Until Free\" opportunity-cost figure. I built the FastAPI backend, the stock engine (CAGR from yfinance history, with a fallback when data looks bad), the personalized recommendations and the frontend API integration, with two teammates on the extension UI, scraping and stock service.",
    status: "shipped",
    tags: ["Backend", "Hackathon"],
    period: "Nov 2025",
    technologies: ["Python", "FastAPI", "yfinance", "React", "TypeScript", "Chrome extension"],
    github: "https://github.com/sarahchiang0529/Hack-Western-XII",
    image: {
      src: media("projects/wowie.webp"),
      alt: "Two WoWie popup cards: an intro reading \"Girl... What happened to becoming a WoW?\" over an Oprah GIF, and a result showing that about $153 in NVDA six months ago would have made $201.76, a 232% return.",
      width: 806,
      height: 500,
    },
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
    image: {
      src: media("projects/intern-compass.webp"),
      alt: "The Intern Compass chat screen: a sidebar with Chat, Outline and Admin, a welcome message from the assistant and four quick-start questions.",
    },
  },
  {
    id: "asl-digits",
    title: "ASL Hand-Gesture Recognition",
    tagline: "CNN on webcam hand gestures",
    description:
      "A DATASCI 3000B group project, presented March 31, 2026, that recognizes American Sign Language from images or a live webcam. It trains on ASL-HG phone photos with real backgrounds, crops each hand with MediaPipe landmarks (cached once), converts it to 128×128 grayscale and classifies it with an ASLNet CNN (BatchNorm, dropout) over 36 classes, digits 0-9 and letters A-Z. It scores 99.98% on a held-out test set of 5,394 images. The split is random, so volunteers overlap, and look-alike signs (2/V, 6/W, 0/O) and the motion letters J and Z can't be told apart from a single frame.",
    status: "school",
    tags: ["AI", "Computer Vision"],
    period: "Winter 2026",
    technologies: ["Python", "PyTorch", "MediaPipe", "OpenCV"],
    github: "https://github.com/alam389/ASL_numbers_CNN",
    video: {
      src: media("projects/asl-cnn-demo.mp4"),
      label: "Live webcam demo of the ASL classifier recognizing hand gestures.",
    },
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

import type { Profile, SkillGroup } from "./types";

export const profile: Profile = {
  name: "Anthony Lam",
  role: "Software Engineer",
  location: "London, ON",
  email: "lamanthony167@gmail.com",
  summary: [
    "I'm a software engineering student at Western University with a focus on applied AI development. I bring a new perspective on how we can solve problems with new emerging technology and I thrive in fast-paced iterative environments.",
    "Right now I'm a software engineering intern at Kiyoko Beauty, an online store for Asian beauty products, from September to April. I work on the AI side: I helped launch a beauty assistant on Kiyoko's Shopify store that recommends products based on a shopper's skin concerns, and I build the retrieval pipelines behind it with Vertex AI Vector Search and Gemini embeddings. I'm also building a mobile app with React Native and Supabase that helps people put together a skincare routine from any products, including ones Kiyoko doesn't sell.",
    "Before that, I built a Graph-RAG ingestion pipeline at McGregor-Allsop, and on the side I'm building Mneme, my own document-to-memory service.",
  ],
  education: {
    school: "University of Western Ontario",
    degree: "BASc Software Engineering",
    period: "Sept 2022 – 2027",
    gpa: "3.7",
    coursework: [
      "Multi-Agent Architecture",
      "Data Structures and Algorithms",
      "Cloud Computing",
      "Intro to Machine Learning",
      "Data Engineering",
      "Applications of AI & Software",
    ],
    awards: [
      {
        id: "best-design-in-category",
        title: "Best Design in Category",
        issuer: "ES 1050-22 Lab19, Instructor: Jacob Reeves",
        date: "Apr 2023",
        description:
          "Won best in category for the best chair project, aimed at helping patients and elderly people move safely from sitting to standing without relying on their legs for support. Also placed 3rd overall across all 144+ ES1050 teams for best presentation.",
      },
      {
        id: "best-in-class-semi-automation",
        title: "Best-in-Class Semi-Automation",
        issuer: "ES1050-22, Instructor: Jacob Reeves",
        date: "Dec 2022",
        description:
          "Voted best semi-automated device design for my washer-sorting wheel. The project aimed to help people with impairments sort materials like washers, screws, nuts and bolts. My design sorted washers of certain sizes into separate piles.",
      },
    ],
  },
  socials: [
    { label: "GitHub", href: "https://github.com/alam389" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/anthony-lam/" },
    { label: "Email", href: "mailto:lamanthony167@gmail.com" },
  ],
  // Restates the summary; update both when something changes.
  now: {
    updated: "Oct 2026",
    items: [
      "Interning at Kiyoko Beauty, building the retrieval pipelines behind its Shopify beauty assistant.",
      "Building a React Native + Supabase app that turns any set of products into a skincare routine.",
      "Building Mneme, my document-to-memory service, on the side.",
    ],
  },
};

export const skills: SkillGroup[] = [
  {
    label: "Languages",
    items: ["Java", "Python", "TypeScript", "JavaScript", "SQL", "Go"],
  },
  {
    label: "Frameworks",
    items: ["React", "React Native", "Next.js", "Node.js", "Express", "FastAPI", "Spring Boot"],
  },
  {
    label: "AI & Data",
    items: [
      "LangChain",
      "LangGraph",
      "Hugging Face",
      "PyTorch",
      "Gemini",
      "Claude API",
      "Pinecone",
      "Chroma",
      "Neo4j",
      "PostgreSQL",
      "Supabase",
    ],
  },
  {
    label: "Systems",
    items: ["Docker", "AWS", "Google Cloud (Vertex AI)", "Azure Blob Storage", "GitHub Actions"],
  },
];

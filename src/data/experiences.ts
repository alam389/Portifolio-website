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
      "Developed an in-house HCM web application for 30+ employees to streamline annual reviews, project management and employee information, cutting $6,000 in SaaS products.",
      "Architected a Graph-RAG ingestion pipeline that semantically indexes 10,000+ pages of engineering documents and answers up to 100x faster than manual file-server search.",
      "Built RFP automation workflows using RAG, the Claude API, Hugging Face embedding models and Chroma to generate grounded technical responses from IBM product documentation.",
    ],
    details: [
      {
        title: "In-house HCM platform",
        story: [
          "When I got there, HR was tracking everyone by hand. Performance reviews happened twice a year on paper, and the rest of the records were spread across file servers or just lived in people's heads. Their ERP didn't do human capital management at all, so I pitched building an HCM platform in-house, from scratch.",
          "Honestly, I'd never run a full development cycle before. I had a project management course and a few hobby projects, and I was the only developer at the company. So I learned it on the job: sitting with HR, the engineers and the CEO to work out how they actually did reviews, turning that into requirements, modelling the data, designing the UI, and iterating every time they changed their minds, which was often.",
          "It's a Spring Boot backend with a React and Electron desktop app and a Next.js web app. One fun problem was login. IT didn't approve Azure authentication, so I had to get Microsoft sign-in working over LDAP directly, with no documentation and nobody there who'd touched LDAP. I just kept making the problem smaller until it worked.",
          "We rolled it out to 30+ employees. Reviews, career progression and certifications are all in one place now, and it replaced about $6,000 of SaaS tools.",
        ],
      },
      {
        title: "MAL-Athena, internal AI document search",
        story: [
          "The other half of my co-op was AI R&D. The firm knew it had fallen behind on AI but didn't know where to start. They've got project data going back decades: PDFs, scanned drawings, photos, emails, Teams chats where decisions actually got made. And because of client NDAs, sending any of that to a cloud LLM wasn't an option.",
          "Nothing from class really covered this, so I went to research papers. The one that shaped the design was Xu et al.'s SIGIR '24 paper on combining knowledge graphs with RAG for question answering. I adapted that into a Graph-RAG pipeline that indexes 10,000+ pages and runs fully on-prem.",
          "It cuts manual searching by about 95%, and answers come back up to 100x faster than digging through the file server. I demoed the prototype to the execs, walked them through the trade-offs and where it could realistically help, and the conversation went from 'should we do AI?' to 'how do we roll this out?' It's not in company-wide use yet, but that's the plan.",
        ],
      },
      {
        title: "RFP automation",
        story: [
          "I also built RFP automation. Answering RFPs meant pulling technical details out of IBM product docs by hand, so I set up RAG workflows with the Claude API, Hugging Face embeddings and Chroma that draft the responses straight from the documentation.",
        ],
      },
      {
        title: "Shipping during exam season",
        story: [
          "One time I got a ticket to ship a feature right in the middle of exams. Both mattered, so instead of quietly stretching myself thin, I broke the ticket down, figured out what I could realistically do around studying, and took that plan to my manager. I asked for time off around my exam dates too.",
          "I shipped it on time and didn't tank my exams. Since then I'm upfront about my capacity as soon as a deadline looks tight.",
        ],
      },
    ],
  },
];

export const volunteering: Experience[] = [
  {
    id: "tethos",
    title: "Founding Member & SWE Lead",
    company: "Tech for Social Impact (TETHOS)",
    location: "London, ON / UWO campus",
    period: "Sept 2023 – Apr 2025",
    highlights: [],
    subroles: [
      {
        id: "plan-catalyst",
        title: "Project Manager",
        company: "Plan Catalyst",
        location: "Remote (UK)",
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
    ],
  },
  {
    id: "fls",
    title: "IT Manager",
    company: "Fashion & Lifestyle Society",
    location: "London, ON",
    period: "Fall – Winter 2025",
    highlights: [
      "Led development of a new website for F&LS focused on user experience, showcasing past fall/winter shows, news articles and magazine issues (React, Vite, TypeScript).",
      "Set up communication channels for 100+ members to collaborate on the fashion shows.",
    ],
  },
];

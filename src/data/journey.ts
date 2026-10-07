import type { JourneyStop } from "./types";

const MOCK = "Placeholder trip. Replace with a real one or delete.";
const REMOTE_PIN = "Remote role. Confirm where you were based.";

// Array order is the journey's order: the cards scroll and the globe flies
// from stop to stop exactly as listed here, and dates are display-only. Career
// and education come from the current resume; the travel stops are mocks
// until replaced.
export const journey: JourneyStop[] = [
  {
    id: "born",
    date: "2004",
    place: "Niagara, ON",
    lat: 43.0896,
    lng: -79.0849,
    kind: "life",
    title: "Born in Niagara",
    description: "This is where I spent the majority of my life here. It's a quiet and peaceful area and shaped much of who I am, but it couldn't contain my ambitions",

  },
  {
    id: "western",
    date: "Sept 2022",
    place: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    kind: "education",
    title: "Started Software Engineering at Western",
    description: "BASc Software Engineering, University of Western Ontario.",
  },
  { 
    id: "tsi",
    date: "Sept 2024",
    place: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    kind: "volunteering",
    title: "Founding member of Tech for Social Impact (TETHOS)",
    description: "I was brought in as a Project Manager to lead projects to develop free software solutions for non-for-profits orgs",
  },
  {
    id: "bgc",
    date: "Sept 2024",
    place: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    kind: "volunteering",
    title: "Team Lead, Boys & Girls Club",
    description:
      "Delivered a web analytics solution that let BGC London track traffic from 1,000+ users for the first time.",
  },
  {
    id: "mcgregor",
    date: "May 2025",
    place: "North York, ON",
    lat: 43.7615,
    lng: -79.4111,
    kind: "work",
    title: "Software Developer co-op, McGregor-Allsop",
    description:
      "Built an ERP web app and a Graph-RAG pipeline indexing 10,000+ pages of engineering documents.",
  },
  {
    id: "trip",
    date: "July 2025",
    place: "Westlock County, AB",
    lat: 53.9835,
    lng: -113.8709,
    kind: "travel",
    title: "Meditation retreat at Westlock",
    description:
      "A retreat at the Westlock Meditation Centre north of Edmonton: sitting and walking meditation, mindful eating, and Dharma talks.",
  },
  {
    id: "plan-catalyst",
    date: "Sept 2025",
    place: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    kind: "volunteering",
    title: "Project Manager, Plan Catalyst",
    description:
      "Led two engineering squads using SAFe Agile to deliver a database system for Project SHARE.",
    remote: true,
    draft: "UK-based org. City unconfirmed; pinned at London.",
  },
  {
    id: "hack-the-valley",
    date: "Oct 2025",
    place: "Toronto, ON",
    lat: 43.7845,
    lng: -79.1864,
    kind: "project",
    title: "Hack the Valley: Intern Compass",
    description:
      "Built the backend of an AI onboarding assistant that answers questions from company documents with citations.",
    draft: "Venue unconfirmed. Assumed UofT Scarborough.",
  },
  {
    id: "kiyoko",
    date: "May 2026",
    place: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    kind: "work",
    title: "Software Engineer Intern, Kiyoko Beauty",
    description:
      "Helped launch an AI beauty assistant on Shopify; 20% of conversations ended in an add-to-cart across 1,000+ beta sessions.",
    remote: true,
    draft: REMOTE_PIN,
  },
  {
    id: "now",
    date: "Now",
    place: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    kind: "education",
    title: "Final year at Western",
    description:
      "Building Mneme, a document-to-memory service, and the Pony AI capstone.",
    now: true,
  },
];

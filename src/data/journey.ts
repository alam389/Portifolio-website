import type { JourneyStop } from "./types";

const MOCK = "Placeholder trip. Replace with a real one or delete.";
const REMOTE_PIN = "Remote role. Confirm where you were based.";

// Chronological. Career and education come from the current resume; the
// travel stops are mocks until replaced.
export const journey: JourneyStop[] = [
  {
    id: "born",
    date: "2004",
    place: "Niagara, ON",
    lat: 43.0896,
    lng: -79.0849,
    kind: "life",
    title: "Born in Niagara",
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
    id: "trip-vancouver",
    date: "Jul 2023",
    place: "Vancouver, BC",
    lat: 49.2827,
    lng: -123.1207,
    kind: "travel",
    title: "West coast trip",
    draft: MOCK,
  },
  {
    id: "bgc",
    date: "Sept 2024",
    place: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    kind: "work",
    title: "Team Lead, Boys & Girls Club",
    description:
      "Delivered a web analytics solution that let BGC London track traffic from 1,000+ users for the first time.",
  },
  {
    id: "trip-tokyo",
    date: "Dec 2024",
    place: "Tokyo, Japan",
    lat: 35.6762,
    lng: 139.6503,
    kind: "travel",
    title: "Winter in Tokyo",
    draft: MOCK,
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
    id: "trip-lisbon",
    date: "Aug 2025",
    place: "Lisbon, Portugal",
    lat: 38.7223,
    lng: -9.1393,
    kind: "travel",
    title: "Summer in Lisbon",
    draft: MOCK,
  },
  {
    id: "plan-catalyst",
    date: "Sept 2025",
    place: "North York, ON",
    lat: 43.7615,
    lng: -79.4111,
    kind: "work",
    title: "Project Manager, Plan Catalyst",
    description:
      "Led two engineering squads using SAFe Agile to deliver a database system for Project SHARE.",
    remote: true,
    draft: REMOTE_PIN,
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

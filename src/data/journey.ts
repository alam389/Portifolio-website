import { media } from "./media";
import type { JourneyStop } from "./types";

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

    photos: [
      { src: media("journey/niagara1.webp"), alt: "A golfer mid-swing at a driving range under an evening sky." },
    ],
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
    id: "westlock",
    date: "July 2024",
    place: "Westlock County, AB",
    lat: 53.9835,
    lng: -113.8709,
    kind: "travel",
    title: "Meditation retreat at Westlock",
    description:
      "A retreat at the Westlock Meditation Centre north of Edmonton: sitting and walking meditation, mindful eating, and Dharma talks.",
    photos: [
      { src: media("journey/westlock.webp"), alt: "The northern lights above a statue on the retreat grounds at night." },
      { src: media("journey/westlock1.webp"), alt: "A group photo of retreat participants on the lawn at dusk." },
      { src: media("journey/westlock2.webp"), alt: "Six friends posing indoors at the meditation centre." },
      { src: media("journey/westlock3.webp"), alt: "A volleyball game on the lawn, with a monk in robes looking on." },
      { src: media("journey/westlock4.webp"), alt: "A white laughing Buddha statue outside a temple building." },
      { src: media("journey/westlock5.webp"), alt: "A pond at sunset framed by trees and a rock garden." },
    ],
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
    id: "bgc",
    date: "Sept 2024",
    place: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    kind: "volunteering",
    title: "Team Lead, Boys & Girls Club",
    description:
      "Delivered a web analytics solution that let BGC London track traffic from 1,000+ users for the first time.",
    embed: {
      src: "https://www.linkedin.com/embed/feed/update/urn:li:share:7272254151802150912?collapsed=1",
      title: "LinkedIn post about the Boys & Girls Club project",
    },
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
    id: "banff",
    date: "July 2025",
    place: "Banff National Park, AB",
    lat: 51.1784,
    lng: -115.5708,
    kind: "travel",
    title: "Banff National Park",
    description: "A trip out to Banff National Park in the Canadian Rockies.",
    photos: [
      { src: media("journey/banff1.webp"), alt: "Five friends sitting on a stone wall in front of a turquoise lake and mountains." },
      { src: media("journey/banff.webp"), alt: "A mountain and turquoise lake seen through pine trees." },
      { src: media("journey/banff2.webp"), alt: "A turquoise alpine lake below a rock face and pine forest." },
    ],
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
    logo: { src: "/logos/kiyoko.svg", alt: "Kiyoko Beauty" },
    links: [
      { label: "Kiyoko", href: "https://kiyoko.ca/en-ca" },
      { label: "LinkedIn post", href: "https://lnkd.in/p/g7aDVcWV" },
    ],
    remote: true,
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

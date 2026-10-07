export interface Social {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  email: string;
  summary: string[];
  education: {
    school: string;
    degree: string;
    period: string;
    gpa: string;
    coursework: string[];
  };
  socials: Social[];
  /** The "Now" section on About: what Anthony is focused on at the moment. */
  now: {
    /** Display date for when this was last true, e.g. "Oct 2026". */
    updated: string;
    items: string[];
  };
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export type ProjectStatus = "shipped" | "in-progress" | "early" | "school";

/** What kind of work a project is; shown as category tags on the card. */
export type ProjectTag =
  | "AI"
  | "RAG"
  | "Backend"
  | "Data"
  | "Mobile"
  | "Computer Vision"
  | "Client work"
  | "Hackathon"
  | "Capstone";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  tags: ProjectTag[];
  period?: string;
  technologies: string[];
  github?: string;
  live?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export type JourneyKind = "life" | "education" | "work" | "project" | "travel" | "volunteering";

export interface JourneyStop {
  id: string;
  /** Display date only, e.g. "Sept 2022". Position in the array sets the order. */
  date: string;
  place: string;
  lat: number;
  lng: number;
  kind: JourneyKind;
  title: string;
  description?: string;
  /** Remote role: pinned where Anthony was, not where the company is. */
  remote?: boolean;
  /** The current stop; the journey ends here. */
  now?: boolean;
  /** Set on mocked or unverified stops. Shown as a "Draft" badge with this note. */
  draft?: string;
}

// Interests page. Every entry can carry `draft`: shown with a "Draft" badge
// in dev, filtered out of production builds.

/** An image under public/, e.g. "/interests/cooking/ramen.jpg". */
export interface Photo {
  src: string;
  alt: string;
}

/** An AI paper Anthony has read, with what he took from it. */
export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  /** Where it was published, e.g. "NeurIPS". Omit for preprints. */
  venue?: string;
  /** arXiv or PDF link. */
  url: string;
  /** Anthony's own one- or two-line takeaway. */
  takeaway?: string;
  /** Topics, e.g. "agents", "RAG". */
  tags: string[];
  /** What the paper itself claims. Gives the entry its own page at /interests/papers/[id]. */
  summary?: PaperSummary;
  draft?: string;
}

/** A plain-language summary of a paper's own claims, not Anthony's opinion of it. */
export interface PaperSummary {
  /** Two or three sentences: what the paper is and why it matters. */
  overview: string;
  /** The gap or question the paper tackles. */
  problem: string;
  approach: string[];
  findings: string[];
  /** Headline numbers the paper reports, e.g. { label: "MRR", value: "+77.6%" }. */
  stats?: { label: string; value: string }[];
  /** Caveats the authors raise themselves. */
  limitations?: string[];
}

/** A dish Anthony cooks. Without a photo it renders as a plain name card. */
export interface Dish {
  id: string;
  name: string;
  /** e.g. "My weeknight default". */
  note?: string;
  cuisine?: string;
  photo?: Photo;
  draft?: string;
}

/** A restaurant Anthony eats at. Grouped by city on the page. */
export interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine: string;
  /** What he orders there. */
  order: string;
  mapsUrl?: string;
  draft?: string;
}

/** A way Anthony stays active: a sport, the gym. */
export interface Activity {
  id: string;
  title: string;
  description: string;
  /** Short specifics shown as chips, e.g. "Doubles", "3×/week". */
  facts: string[];
  /** Personal records, e.g. { label: "Bench", value: "100 kg" }. */
  prs?: { label: string; value: string }[];
  photo?: Photo;
  draft?: string;
}

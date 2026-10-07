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

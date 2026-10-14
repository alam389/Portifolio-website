export interface Social {
  label: string;
  href: string;
}

/** An award or recognition, shown under the school on the Experience page. */
export interface Award {
  id: string;
  title: string;
  /** Who gave it, e.g. a course and instructor. */
  issuer: string;
  /** Display date, e.g. "Apr 2023". */
  date: string;
  description: string;
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  email: string;
  /** GitHub username, used for the contribution graph. */
  githubUser: string;
  summary: string[];
  education: {
    school: string;
    degree: string;
    period: string;
    gpa: string;
    coursework: string[];
    awards: Award[];
  };
  socials: Social[];
  /** One factual line under the headline for recruiters, e.g. "Open to new-grad roles from May 2027". Hidden when unset. */
  availability?: string;
  /** The "Selected work" section on About: the strongest results, for a quick scan. */
  selectedWork: SelectedWork[];
  /** The "Now" section on About: what Anthony is focused on at the moment. */
  now: {
    /** Display date for when this was last true, e.g. "Oct 2026". */
    updated: string;
    items: string[];
  };
}

/** A headline result on About, linking to where the full account lives. */
export interface SelectedWork {
  title: string;
  /** Where and when, shown as metadata, e.g. "Kiyoko Beauty · 2026". */
  context: string;
  /** One sentence with the measurable result. */
  outcome: string;
  /** Internal link, e.g. "/experience#kiyoko". */
  href: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
  /** Longer accounts of the work behind the highlights. Read by the AI twin; not rendered yet. */
  details?: ExperienceDetail[];
  /** Roles held under this one, e.g. client projects led within an organization. */
  subroles?: Experience[];
}

/** One piece of work in a role, told in Anthony's own voice as if in conversation. */
export interface ExperienceDetail {
  title: string;
  /** First-person paragraphs. */
  story: string[];
}

export type ProjectStatus = "shipped" | "in-progress" | "early" | "school";

/** What kind of work a project is; shown as category tags on the card. */
export type ProjectTag =
  | "AI"
  | "RAG"
  | "Backend"
  | "Frontend"
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
  /** Screenshot shown at the top of the card. */
  image?: Photo;
  /** Demo clip shown at the top of the card (path under public/). Takes the place of `image`. */
  video?: Video;
  /** The longer story, first person, as if Anthony were telling it. Rendered on the project's page when it has `architecture`; also read by the AI twin. */
  story?: string[];
  /** A pipeline diagram where each step explains its design decision. Gives the project its own page at /projects/[id]. */
  architecture?: Architecture;
}

/** A system drawn as steps in order; each step carries the reason it's built that way. */
export interface Architecture {
  steps: ArchitectureStep[];
}

export interface ArchitectureStep {
  id: string;
  /** What the step is, e.g. "MediaPipe hand crop". */
  label: string;
  /** Short specifics under the label, e.g. "128×128 grayscale". */
  detail?: string;
  /** Why it's built this way; shown when the step is hovered, focused or tapped. */
  why: string;
  /** What was tried or proposed first, and why it lost. */
  instead?: string;
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
  /** External links shown under the description, e.g. the company site. */
  links?: Social[];
  /** Organization logo shown at the top of the card; a dark mark on transparent. */
  logo?: Photo;
  /** Photos from this stop, shown as a row of thumbnails; the first leads. */
  photos?: Photo[];
  /** An embeddable post (e.g. LinkedIn's "Embed this post" URL) shown in the card. */
  embed?: { src: string; title: string };
  /** Remote role: pinned where Anthony was, not where the company is. */
  remote?: boolean;
  /** The current stop; the journey ends here. */
  now?: boolean;
  /** Set on mocked or unverified stops. Shown as a "Draft" badge with this note. */
  draft?: string;
}

// Interests page. Every entry can carry `draft`: shown with a "Draft" badge
// in dev, filtered out of production builds.

/** An image URL: media("journey/banff.webp") for the Supabase bucket, or a path under public/. */
export interface Photo {
  src: string;
  alt: string;
  /** Intrinsic size in px, to reserve layout space; project card images default to 1400×711. */
  width?: number;
  height?: number;
}

/** A video clip played with native controls; `label` is its accessible name. */
export interface Video {
  src: string;
  label: string;
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

/** A book Anthony has read. */
export interface Book {
  id: string;
  title: string;
  authors: string;
  year: number;
  publisher?: string;
  url: string;
  /** Anthony's own one- or two-line takeaway. */
  takeaway?: string;
  tags: string[];
  draft?: string;
}

/** A single podcast episode, so the takeaway is tied to what was said. */
export interface Podcast {
  id: string;
  /** The show, e.g. "Latent Space". */
  show: string;
  /** Leave out to list the whole show rather than one episode. */
  episode?: string;
  guest?: string;
  /** Display date, e.g. "Oct 2026". */
  date?: string;
  /** Episode or show link (Spotify, Apple, YouTube or the show's site). */
  url: string;
  /** Show Spotify's player under the entry ("video" for video podcasts). Needs an open.spotify.com `url`. */
  embed?: "audio" | "video";
  /** What the show is and what it covers. */
  about?: string;
  /** How Anthony uses it. */
  takeaway?: string;
  tags: string[];
  draft?: string;
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

// AI twin. Facts only the twin needs: what visitors ask that the site doesn't
// show. Everything the site shows, the twin reads from the modules above.

/** A question visitors ask, with Anthony's own answer. */
export interface TwinFact {
  id: string;
  question: string;
  /** In Anthony's words, first person. The twin may rephrase but not add to it. */
  answer: string;
  /** Set on placeholders. Drafts never reach the twin in production. */
  draft?: string;
}

export interface Twin {
  /** How the twin talks, e.g. "Short answers, no buzzwords". */
  voice: string[];
  /** Topics the twin declines and points to email instead, e.g. salary expectations. */
  offLimits: string[];
  facts: TwinFact[];
}

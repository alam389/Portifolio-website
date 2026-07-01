export interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  type: string;
  status: string;
  description: string;
  achievements: string[];
  technologies: string[];
  website?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  services: string;
  technologies: string[];
  image: string;
  date?: string;
  github?: string;
  live?: string;
}

export interface Skill {
  name: string;
  /** Icon slug (e.g. from simple-icons / react-icons) to wire up in the UI. */
  icon: string;
  color: string;
}

export interface Social {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  role: string;
  subtitle: string;
  born: string;
  location: string;
  email: string;
  githubHandle: string;
  hero: string[];
  about: string[];
  contactBlurb: string;
  socials: Social[];
  copyright: string;
  lastUpdated: string;
}

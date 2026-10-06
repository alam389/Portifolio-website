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

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  period?: string;
  technologies: string[];
  github?: string;
  live?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

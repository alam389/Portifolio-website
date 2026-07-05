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

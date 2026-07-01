import type { Profile } from "./types";

export const profile: Profile = {
  name: "Anthony Lam",
  role: "Software Engineer",
  subtitle: "Aspiring Software Engineer",
  born: "Born in 2004, Niagara, Canada.",
  location: "London, ON",
  email: "lamanthony167@gmail.com",
  githubHandle: "@alam389",
  hero: [
    "Passionate about all things related to software engineering.",
    "I like to explore and tinker with new technologies to apply them to real-world problems.",
    "My mission: Become the very definition of a software engineer.",
  ],
  about: [
    "I'm Anthony Lam, a fourth-year Software Engineering student at Western University. I love everything about software engineering, from designing and building applications to learning new technologies and improving my skills. I don't like to stick to a specific technology stack, I am always looking to learn new things and improve my skills.",
    "Right now, I will be completing my fourth year of university and I will be working part-time as a Software Developer at McGregor Allsop. On the side, I am working on taking the AWS Developer Associate certification, and working on a few personal projects to improve my skills.",
    "Looking ahead, I'm on the hunt for more opportunities to learn new and emerging technologies to stay relevant in the industry. Possibly look into the Cloud development path to work with AWS or Azure and continue my work at Tech for Social Impact and build more projects to improve my skills.",
  ],
  contactBlurb:
    "I'm always interested in new opportunities and exciting projects. If you have questions for want advice, or just want to chat, feel free to reach out.",
  socials: [
    { label: "Email", href: "mailto:lamanthony167@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/anthony---lam/" },
    { label: "GitHub", href: "https://github.com/alam389" },
  ],
  copyright: "©2025 Anthony Lam",
  lastUpdated: "2025-12-26T10:30:00Z",
};

// EmailJS configuration used by the old contact form (public keys).
export const emailConfig = {
  serviceId: "service_g50dey7",
  templateId: "template_b3y318w",
  publicKey: "yLYI6joHYuHnt6mlb",
  toEmail: "lamanthony167@gmail.com",
};

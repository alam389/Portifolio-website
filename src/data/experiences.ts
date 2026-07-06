import type { Experience } from "./types";

// Restored from git history (ad36792) for the landing's Experience section.
// Spelling/grammar cleaned for a recruiter-facing surface; facts unchanged.

export const experiences: Experience[] = [
  {
    id: 1,
    title: "Software Developer",
    company: "McGregor Allsop",
    location: "Remote · London, ON",
    period: "December 2025 – Current",
    type: "Part-Time",
    status: "Current",
    description:
      "Picked up where I left off as an intern — developing and maintaining internal tools, and querying financial and project data for the accounting team and CEO.",
    achievements: [
      "Balancing part-time professional work with a full university course load",
    ],
    technologies: ["React", "Vite", "TypeScript", "SQL", "PostgreSQL"],
    website: "https://mcgregor-allsop.com/",
  },
  {
    id: 2,
    title: "IT Manager",
    company: "Fashion & Lifestyle Society",
    location: "London, ON",
    period: "Fall–Winter 2025",
    type: "Volunteering",
    status: "Current",
    description:
      "Leading development of a new website for F&LS with a focus on user experience — showcasing past fall/winter shows, news articles, and magazine issues. Currently in development.",
    achievements: [
      "Set up communication channels for 100+ members to collaborate on the fashion shows",
      "Made more progress on the website than previous IT Managers' attempts",
    ],
    technologies: ["React", "Vite", "TypeScript"],
  },
  {
    id: 3,
    title: "Database Developer Intern",
    company: "McGregor Allsop",
    location: "Toronto, ON",
    period: "Summer–Fall 2025",
    type: "Internship",
    status: "Completed",
    description:
      "Designed and deployed internal tools to improve efficiency and reduce manual work. Queried financial and project data for reporting and analysis by the accounting team and CEO.",
    achievements: [
      "Built a new SQL report workflow saving ~$6,000 in external contractor fees",
      "Deployed a web and desktop application on Windows Server",
      "Developed an HR tracking application saving ~$6,000 in yearly subscription fees",
    ],
    technologies: ["SQL", "PostgreSQL", "Database Design", "Performance Optimization"],
    website: "https://mcgregor-allsop.com/",
  },
  {
    id: 4,
    title: "Backend Team Lead",
    company: "EmpowHERto",
    location: "Remote",
    period: "Spring 2025",
    type: "Project",
    status: "Completed",
    description:
      "Developed a comprehensive web platform for a nonprofit empowering young women — user authentication, dashboards, curriculum tracking, and team profiles.",
    achievements: [
      "Directed a small team of 3 developers",
      "Translated business requirements into technical specifications for the backend",
      "Ran weekly sprints and client meetings to keep delivery on track",
      "Mentored developers with no prior experience into capable backend contributors",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase PostgreSQL"],
  },
  {
    id: 5,
    title: "Team Lead",
    company: "Boys & Girls Club of London",
    location: "Remote",
    period: "Fall 2024 – Winter 2025",
    type: "Project",
    status: "Completed",
    description:
      "Acted as a tech consultant for BGC London to track user traffic across various media sources.",
    achievements: [
      "Surfaced 1,000+ unique monthly visitors that were previously untracked",
      "Integrated Google Analytics and QR codes to attribute traffic to specific media and in-person events",
    ],
    technologies: ["Google Analytics"],
  },
  {
    id: 6,
    title: "Software Engineering Student",
    company: "Western University",
    location: "London, ON",
    period: "2022 – 2027",
    type: "Education",
    status: "In Progress",
    description:
      "Fourth-year Software Engineering student focused on backend systems, database design, and full-stack development. Dean's List recipient.",
    achievements: [
      "Focus on backend and database systems",
      "Full-stack development expertise",
      "Expected graduation: 2027",
    ],
    technologies: ["Java", "Python", "C++", "Software Architecture", "Database Design"],
    website: "https://uwo.ca",
  },
];

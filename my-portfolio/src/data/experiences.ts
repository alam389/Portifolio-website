import type { Experience } from "./types";

export const experiences: Experience[] = [
  {
    id: 1,
    title: "Software Developer",
    company: "McGregor Allsop",
    location: "Remote, London, ON",
    period: "December 2025 - Current",
    type: "Part-Time",
    status: "Current",
    description:
      "Picked up where I left off as an intern, I will be responsible for developing and maintaining internal tools for the company, as well as querying finanical and project data for the accounting team and CEO.",
    achievements: ["Time management to juggle part-time work and university"],
    technologies: ["React", "Vite", "Typescript", "SQL", "PostgreSQL"],
    website: "https://mcgregor-allsop.com/",
  },
  {
    id: 2,
    title: "IT Mangager",
    company: "Fashion & Lifestyle Society",
    location: "London, ON",
    period: "Fall-Win 2025",
    type: "Volunteering",
    status: "Current",
    description:
      "Leading the development of a new website for F&LS. Built with React and Next.js. Features a focus on user experience, it displays their previous fall/winter shows, news articles and magazine issues. The website is currently in development.",
    achievements: [
      "Developed communcation channels for 100+ members to communicate and collaborate on the fashion shows",
      "Made more progress on the website than pervious attempts from past IT Managers",
    ],
    technologies: ["React", "Vite", "Typescript"],
  },
  {
    id: 3,
    title: "Database Developer Intern",
    company: "McGregor Allsop",
    location: "Toronto, ON",
    period: "Summer/Fall 2025",
    type: "Internship",
    status: "Completed",
    description:
      "Responible for designing and deploying internal tools meant to improve efficiency and reduce manual work for the company. Quered finanical and project data for reporting and analysis by the accounting team and CEO.",
    achievements: [
      "Developed new SQL report workflow saving the company in $6000 in external contractor fees",
      "Deployed a web and desktop application in Windows Server",
      "Developed HR tracking application saving $6000 in yearly subscription fees",
    ],
    technologies: ["SQL", "PostgreSQL", "Database Design", "Performance Optimization"],
    website: "https://mcgregor-allsop.com/",
  },
  {
    id: 4,
    title: "Backend Team Lead",
    company: "EmpbraceHERto",
    location: "Remote",
    period: "Spring 2025",
    type: "Project",
    status: "Completed",
    description:
      "Developed a comprehensive web platform for a nonprofit empowering young women. Built user authentication, dashboards, curriculum tracking, and team profiles.",
    achievements: [
      "Directed a small team of 3 developers",
      "Translated business requirements into technical specifications for backend development",
      "Scheduled weekly sprints and meetings with client to ensure project delivery",
      "Turnt new devs with no prior experience into capable backend developers ",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Supabase PostgreSQL",
      "Led cross-functional team",
      "Communication",
    ],
    website: "#",
  },
  {
    id: 5,
    title: "Team Lead",
    company: "Boy and Girl Club of London",
    location: "Remote",
    period: "Fall 2024 - Winter 2025",
    type: "Project",
    status: "Completed",
    description:
      "Acted as a tech consultant for BGC London to find a way to track user traffic from various sources of media.",
    achievements: [
      "Tracked over 1000 unique visitors per month perviously not known",
      "Integerted with Google Analytics and QR codes to track user traffic from specific sources of media or in-person events",
    ],
    technologies: [
      "Google Analytics",
      "Led cross-functional team",
      "Translating Business to Technical Requirements",
    ],
  },
  {
    id: 6,
    title: "Software Engineering Student",
    company: "Western University",
    location: "London, ON",
    period: "2022 - 2027",
    type: "Education",
    status: "In Progress",
    description:
      "Fourth-year Software Engineering student with focus on backend systems, database design, and full-stack development. Dean's List recipient.",
    achievements: [
      "Focus on backend and database systems",
      "Full-stack development expertise",
      "Expected graduation: 2027",
    ],
    technologies: ["Java", "Python", "C++", "Software Architecture", "Database Design"],
    website: "https://uwo.ca",
  },
];

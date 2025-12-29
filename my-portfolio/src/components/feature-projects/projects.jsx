import React, { useState } from 'react';
import styles from './feature.module.css';
import FadeContent from '../ui/FadeContent';
import ProjectCard from './ProjectCard';

export default function FeatureProjects() {
  const [showAll, setShowAll] = useState(false);
  const projects = [

    {
      id: 1,
      title: "Plan Catalyst DataAnalytics Dashboard",
      description:
      "In charge of designing and implementing cloud infrastructure to house data fetching and ML processing. It makes use of serverless services such as API Gateway, ECS Fargate and Lambda functions.",
      services: "CLOUD INFRASTRUCTURE DESIGN / DATA FETCHING / MACHINE LEARNING",
      technologies: [ "AWS", "Python"],
      image: "/images/AWS-arch.png",
      // Remove or comment out github and live links for private projects
      github: " https://github.com/LlamzonAmazon/PC-Data-Dash",
      // live: "https://example.com",
    }, 

    {
      id: 2,
      title: "Fashion & Lifestyle Society Website",
      description:
      "A web app built for Fashion & Lifestyle Society to display their previous fall/winter shows, news articles and magazine issues. Built with React and Next.js.",
      services: "FRONTEND DEVELOPMENT / UI/UX DESIGN",
      technologies: ["React", "Next.js", "Tailwind CSS", "Figma"],
      image: "/images/FLS.png",
      // No links provided for this project
      github: "https://github.com/alam389/Fashion-and-Lifestyle-Society-Website",
      live: "https://fashion-lifestyle-society.vercel.app/",
    },
    {
      id: 4,
      title: "Hack Western: WoWie",
      description:
      "For HackWestern 12 our solution, WoWie, is a web extension that nudges women to start their investing journey through mindful messages at the point of purchase of their favourite online products.",
      services: "CHROME EXTENSION DEVELOPMENT / UI/UX DESIGN",
      technologies: [ "Next.js", "Tailwind CSS", "Chrome Extension API"],
      image: "/images/Wowie.jpg",
      // Remove or comment out github and live links for private projects
      github: "https://github.com/sarahchiang0529/Hack-Western-XII.git",
      // live: "https://example.com",
    },
    {
      id: 5,
      title: "Hack The Valley: InternCompass",
      description:
      "For HackTheValley 12 our solution, Intern Compass is an intelligent assistant that understands natural language, provides accurate, cited answers from company documents, and makes onboarding efficient and stress-free.",
      services: "FRONTEND DEVELOPMENT / API INTEGRATION / UI/UX DESIGN",
      technologies: [ "React", "Next.js", "Tailwind CSS", "Gemini API"],
      image: "/images/InternCompass.png",
      // Remove or comment out github and live links for private projects
      github: "https://github.com/DanielChahine0/Intern-Compass",
      live: "https://devpost.com/software/intern-compass",
    },
    {
      id: 6,
      title: "Mental Wellness App",
      description:
      "Led the development of a web application for EmpowHERto, a nonprofit empowering young women. The platform supports a 12-week mental health program for teenage girls, featuring user authentication, personalized dashboards, curriculum tracking, and team member profiles. Built using Next.js, React, JS, and Tailwind CSS.",
      services: "FULL-STACK DEVELOPMENT / PAYMENT INTEGRATION / UI/UX DESIGN",
      technologies: [ "Express.js", "Next.js", "Neon PostgreSQL"],
      image: "/images/empBracedash.png",
      // Remove or comment out github and live links for private projects
      // github: "https://github.com",
      // live: "https://example.com",
    },
    {
      id: 7,
      title: "Password management app",
      description:
        "My first personal project, taught me the basics of web development. Built with Angular and Express.js. Features storage of passwords using SHA-256 encryption, and a password generator for easy secure password creation.",
      date: "Winter 2024",
      services: "Password management app",
      technologies: ["Angular", "node.js", "Express.js"],
      image: "./images/let-me-pass.png",
      github: "https://github.com/alam389/let-me-pass-client.git",
      live: "https://let-me-pass-client.vercel.app/",
    },
  ];

  return (
    <section className={styles.featureProjects} id="projects">
      <div className={styles.featureSectionContent}>
        <div className={styles.sectionHeader}>
          <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
            <p className={styles.sectionTitle}>FEATURE PROJECTS</p>
          </FadeContent>
        </div>

        <div className={styles.projectsGrid}>
          {projects.slice(0, 3).map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
          {showAll && projects.slice(3).map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index + 3} />
          ))}
        </div>
        
        {projects.length > 3 && (
          <div className={styles.toggleContainer}>
            <button 
              className={styles.toggleButton}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show ${projects.length - 3} More Projects`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
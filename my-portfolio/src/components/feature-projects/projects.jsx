import React from 'react';
import styles from './feature.module.css';
import ShinyText from '../ui/ShinyText';
import FadeContent from '../ui/FadeContent';

const Github = ({ size = 16 }) => (
  <span style={{ fontSize: size + 'px' }}>📂</span>
);

const ExternalLink = ({ size = 16 }) => (
  <span style={{ fontSize: size + 'px' }}>🔗</span>
);

export default function FeatureProjects() {
  const projects = [
    {
      id: 1,
      title: "EmbraceHer Mental Wellness App",
      description:
      "Led the development of a web application for EmpowHERto, a nonprofit empowering young women. The platform supports a 12-week mental health program for teenage girls, featuring user authentication, personalized dashboards, curriculum tracking, and team member profiles. Built using Next.js, React, JS, and Tailwind CSS.",
      date: "2024",
      services: "FULL-STACK DEVELOPMENT / PAYMENT INTEGRATION / UI/UX DESIGN",
      technologies: ["React", "Typescript", "Express.js", "Next.js", "Neon PostgreSQL"],
      image: "/images/empBracedash.png",
      // Remove or comment out github and live links for private projects
      // github: "https://github.com",
      // live: "https://example.com",
    },
    {
      id: 2,
      title: "Mcgregor Allsop PM App",
      description:
        "A web app built for McGregor Allsop Engineers to reduce data wrangling efforts by a intiutive and easy to use design. A improvement over their old system. Built with React and Springboot for industry level performance. Features document generation and project info autofilling.",
      date: "2024",
      services: "FRONTEND DEVELOPMENT / REAL-TIME FEATURES / API INTEGRATION",
      technologies: ["React", "SpringBoot", "SSMS", "Azure"],
      image: "/images/sc1.png",
      // No links provided for this project
    },
    {
      id: 3,
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
          {projects.map((project, index) => (
            <div key={project.id} className={styles.projectCard}>
              {/* Keep images without FadeContent */}
              <div className={styles.projectImageContainer}>
                <img
                  src={project.image}
                  alt={project.title}
                  className={styles.projectImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                />
              </div>
              
              <div className={styles.projectContent}>
                <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={index * 100}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                </FadeContent>
                <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={index * 100 + 100}>
                  <p className={styles.projectDescription}>{project.description}</p>
                </FadeContent>
                
                <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={index * 100 + 200}>
                  <div className={styles.projectMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>DATE:</span>
                      <span className={styles.metaValue}>{project.date}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>SERVICES:</span>
                      <span className={styles.metaValue}>{project.services}</span>
                    </div>
                  </div>
                </FadeContent>

                <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={index * 100 + 300}>
                  <div className={styles.technologiesSection}>
                    <p className={styles.metaLabel}>TECHNOLOGIES:</p>
                    <div className={styles.technologiesContainer}>
                      {project.technologies.map((tech) => (
                        <ShinyText key={tech} text={tech} className={styles.technology} />
                      ))}
                    </div>
                  </div>
                </FadeContent>

                {/* Conditionally render action buttons only if links are provided */}
                {(project.github || project.live) && (
                  <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={index * 100 + 400}>
                    <div className={styles.projectActions}>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                          <Github size={16} />
                          <span>View Code</span>
                        </a>
                      )}
                      {project.live && (
                        <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                          <ExternalLink size={16} />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </FadeContent>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
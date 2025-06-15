import React from 'react';
import styles from './feature.module.css';
import ShinyText from '../ui/ShinyText';

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
      title: "E-Commerce Platform",
      description:
      "Led the development of a web application for EmpowHERto, a nonprofit empowering young women. The platform supports a 12-week mental health program for teenage girls, featuring user authentication, personalized dashboards, curriculum tracking, and team member profiles. Built using Next.js, React, JS, and Tailwind CSS.",
      date: "2024",
      services: "FULL-STACK DEVELOPMENT / PAYMENT INTEGRATION / UI/UX DESIGN",
      technologies: ["React", "Typescript", "Express.js", "Next.js", "Neon PostgreSQL"],
      image: "/images/empBracedash.png",
      github: "https://github.com",
      live: "https://example.com",
    },
    {
      id: 2,
      title: "Task Management App",
      description:
        "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features. Built with React and Socket.io for seamless real-time communication.",
      date: "2024",
      services: "FRONTEND DEVELOPMENT / REAL-TIME FEATURES / API INTEGRATION",
      technologies: ["React", "Socket.io", "Node.js", "MongoDB", "CSS"],
      image: "https://via.placeholder.com/1200x600/f3f4f6/6b7280?text=Task+Management+App",
      github: "https://github.com",
      live: "https://example.com",
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description:
        "A responsive weather dashboard that provides detailed weather information and forecasts. Features location-based weather data, interactive charts, and a clean, intuitive interface.",
      date: "2023",
      services: "API INTEGRATION / DATA VISUALIZATION / RESPONSIVE DESIGN",
      technologies: ["Vue.js", "Chart.js", "OpenWeather API", "CSS3"],
      image: "https://via.placeholder.com/1200x600/f3f4f6/6b7280?text=Weather+Dashboard",
      github: "https://github.com",
      live: "https://example.com",
    },
  ];

  return (
    <section className={styles.featureProjects} id="projects">
      <div className={styles.featureSectionContent}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>FEATURE PROJECTS</p>
        </div>

        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
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
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDescription}>{project.description}</p>
                
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

                <div className={styles.technologiesSection}>
                  <p className={styles.metaLabel}>TECHNOLOGIES:</p>
                  <div className={styles.technologiesContainer}>
                    {project.technologies.map((tech) => (
                      <ShinyText key={tech} text={tech} className={styles.technology} />
                    ))}
                  </div>
                </div>

                <div className={styles.projectActions}>
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                    <Github size={16} />
                    <span>View Code</span>
                  </a>
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                    <ExternalLink size={16} />
                    <span>Live Demo</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import styles from './feature.module.css';
import { useState, useRef, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
      "Led the development of a web application for EmpowHERto, a nonprofit empowering young women. The platform supports a 12-week mental health program for teenage girls, featuring user authentication, personalized dashboards, curriculum tracking, and team member profiles. Built using Next.js, React, JS, and CSS, I directed a cross-functional team to deliver a responsive, accessible, and scalable solution aligned with the organization's mission.",
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const projectRef = useRef(null);

  const handleNext = () => {
    setDirection('next');
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  const handlePrev = () => {
    setDirection('prev');
    setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
  };

  const currentProj = projects[currentIndex];

  return (
    <section className={styles.featureProjects} id="projects">
      <div className={styles.featureSectionContent}>
        <div className={styles.headerContainer}>
          <p className={styles.sectionTitle}>FEATURE PROJECTS:</p>
          <div className={styles.projectNavigation}>
            <button onClick={handlePrev} className={styles.navButton}>
              <ChevronUp size={16} />
              <span>Prev</span>
            </button>
            <span className={styles.projectCounter}>
              {currentIndex + 1} / {projects.length}
            </span>
            <button onClick={handleNext} className={styles.navButton}>
              <span>Next</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className={styles.carouselContainer}>
          <TransitionGroup
            className={styles.transitionGroup}
            childFactory={(child) =>
              React.cloneElement(child, {
                classNames: direction === 'next' ? 'project-next' : 'project-prev',
              })
            }
          >
            <CSSTransition
              key={currentProj.id}
              nodeRef={projectRef}
              timeout={500}
              classNames={direction === 'next' ? 'project-next' : 'project-prev'}
            >
              <section ref={projectRef} className={styles.projectSection}>
                <div className={styles.projectDetailsContainer}>
                  <div className={styles.projectTextContent}>
                    <h2 className={styles.projectTitle}>{currentProj.title}</h2>
                    <p className={styles.projectDescription}>{currentProj.description}</p>

                    <div className={styles.projectMeta}>
                      <div className={styles.metaItem}>
                        <p className={styles.metaLabel}>DATE:</p>
                        <p className={styles.metaValue}>{currentProj.date}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <p className={styles.metaLabel}>SERVICES:</p>
                        <p className={styles.metaValue}>{currentProj.services}</p>
                      </div>
                    </div>

                    <div className={styles.projectActions}>
                      <a href={currentProj.github} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                        <Github size={16} />
                        <span>View Code</span>
                      </a>
                      <a href={currentProj.live} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                        <ExternalLink size={16} />
                        <span>Live Demo</span>
                      </a>
                    </div>
                  </div>

                  <div className={styles.rightColumnContent}>
                    <div className={styles.imageContainer}>
                      <img
                        src={currentProj.image}
                        alt={currentProj.title}
                        className={styles.projectImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className={styles.technologiesSection}>
                      <p className={styles.metaLabel}>TECHNOLOGIES:</p>
                      <div className={styles.technologiesContainer}>
                        {currentProj.technologies.map((tech) => (
                          <span key={tech} className={styles.technology}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </CSSTransition>
          </TransitionGroup>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import styles from './feature.module.css';
import ShinyText from '../ui/ShinyText';
import FadeContent from '../ui/FadeContent';
import { Github, ExternalLink } from 'lucide-react';

export default function ProjectCard({ project, index = 0 }) {
  return (
    <div className={styles.projectCard}>
      {/* Image at top */}
      {project.image && (
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
      )}
      <div className={styles.projectContent}>
        <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={index * 100}>
          <h3 className={styles.projectTitle}>{project.title}</h3>
        </FadeContent>
        <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={index * 100 + 100}>
          <p className={styles.projectDescription}>{project.description}</p>
        </FadeContent>
        
        {/* Bottom section with tech stack and links - always at bottom */}
        <div className={styles.projectBottomSection}>
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
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.actionButton} title="View Code on GitHub">
                    <Github size={18} />
                  </a>
                )}
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.actionButton} title="View Live Demo">
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </FadeContent>
          )}
        </div>
      </div>
    </div>
  );
}


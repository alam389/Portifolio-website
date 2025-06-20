import React, { useState } from 'react';
import styles from './experiences.module.css';
import FadeContent from '../ui/FadeContent';
import { Briefcase, Calendar, MapPin, ExternalLink, Award } from 'lucide-react';

export default function Experiences() {
  const [activeExperience, setActiveExperience] = useState(0);

  const experiences = [
    {
      id: 1,
      title: "Database Developer Intern",
      company: "McGregor Allsop",
      location: "Toronto, ON",
      period: "Summer 2025",
      type: "Internship",
      status: "Current",
      description: "Optimizing large-scale SQL systems and database performance. Working with enterprise-level data architecture and implementing efficient query strategies.",
      achievements: [
        "Database optimization and performance tuning",
        "SQL query development and analysis",
        "Enterprise data system management"
      ],
      technologies: ["SQL", "PostgreSQL", "Database Design", "Performance Optimization"],
      website: "https://mcgregorallsop.com"
    },
      {
          id: 2,
          title: "Empbrace Backend Team-Lead",
          company: "Tech for Social Impact",
          location: "Remote",
          period: "Spring 2025 - Current",
          type: "Project",
          status: "Completed",
          description: "Developed a comprehensive web platform for a nonprofit empowering young women. Built user authentication, dashboards, curriculum tracking, and team profiles.",
          achievements: [
              "Directed a small team of 3 developers",
              "Translated business requirements into technical specifications for backend development",
              "Scheduled weekly sprints and meetings with client to ensure project delivery",
              "Turnt new devs with no prior experience into capable backend developers "
          ],
          technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Neon PostgreSQL"],
          website: "#"
      },

    {
      id: 4,
      title: "Software Engineering Student",
      company: "Western University",
      location: "London, ON",
      period: "2022 - 2026",
      type: "Education",
      status: "In Progress",
      description: "Fourth-year Software Engineering student with focus on backend systems, database design, and full-stack development. Dean's List recipient.",
      achievements: [
        "Focus on backend and database systems",
        "Full-stack development expertise",
        "Expected graduation: 2026"
      ],
      technologies: ["Java", "Python", "C++", "Software Architecture", "Database Design"],
      website: "https://uwo.ca"
    }
  ];

  return (
    <section className={styles.experiencesSection} id="experience">
      <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
          <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
            <p className={styles.sectionLabel}>CAREER JOURNEY</p>
          </FadeContent>
          <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={100}>
            <h2 className={styles.sectionTitle}>Experience & Education</h2>
          </FadeContent>
        </div>

        <div className={styles.experienceLayout}>
          {/* Timeline Navigation */}
          <div className={styles.timelineNav}>
            {experiences.map((exp, index) => (
              <FadeContent 
                key={exp.id} 
                blur={false} 
                duration={600} 
                delay={index * 100}
              >
                <button
                  className={`${styles.timelineItem} ${activeExperience === index ? styles.active : ''}`}
                  onClick={() => setActiveExperience(index)}
                >
                  <div className={styles.timelineDot}>
                    <Briefcase size={16} />
                  </div>
                  <div className={styles.timelineInfo}>
                    <span className={styles.timelineTitle}>{exp.title}</span>
                    <span className={styles.timelineCompany}>{exp.company}</span>
                    <span className={styles.timelinePeriod}>{exp.period}</span>
                  </div>
                  <div className={`${styles.statusBadge} ${styles[exp.status.toLowerCase()]}`}>
                    {exp.status}
                  </div>
                </button>
              </FadeContent>
            ))}
          </div>

          {/* Experience Details */}
          <div className={styles.experienceDetails}>
            <FadeContent 
              blur={true} 
              duration={800} 
              delay={0}
              key={activeExperience} // This ensures re-animation when switching
            >
              <div className={styles.experienceCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.titleSection}>
                    <h3 className={styles.jobTitle}>{experiences[activeExperience].title}</h3>
                    <div className={styles.companyInfo}>
                      <span className={styles.companyName}>{experiences[activeExperience].company}</span>
                      <div className={styles.metaInfo}>
                        <span className={styles.metaItem}>
                          <Calendar size={14} />
                          {experiences[activeExperience].period}
                        </span>
                        <span className={styles.metaItem}>
                          <MapPin size={14} />
                          {experiences[activeExperience].location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <span className={`${styles.typeBadge} ${styles[experiences[activeExperience].type.toLowerCase()]}`}>
                      {experiences[activeExperience].type}
                    </span>
                    {experiences[activeExperience].website !== "#" && (
                      <a 
                        href={experiences[activeExperience].website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.websiteLink}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <p className={styles.description}>
                  {experiences[activeExperience].description}
                </p>

                <div className={styles.achievementsSection}>
                  <h4 className={styles.achievementsTitle}>
                    <Award size={16} />
                    Key Achievements
                  </h4>
                  <ul className={styles.achievementsList}>
                    {experiences[activeExperience].achievements.map((achievement, index) => (
                      <li key={index} className={styles.achievementItem}>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.technologiesSection}>
                  <h4 className={styles.techTitle}>Technologies & Skills</h4>
                  <div className={styles.techList}>
                    {experiences[activeExperience].technologies.map((tech, index) => (
                      <span key={index} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeContent>
          </div>
        </div>
      </div>
    </section>
  );
}
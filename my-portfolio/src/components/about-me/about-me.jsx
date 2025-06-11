import styles from './about.module.css';

const skills = [
  'JavaScript',
  'TypeScript',
  'Java',
  'SQL',
  'Spring Boot',
  'Express.js',
  'Next.js',
  'React',
  'Vite',
  'Node.js',
  'Neon PostgreSQL',
  'AWS',
];

export default function AboutMe() {
  return (
    <section className={styles.aboutContainer} id="about">
      <div className={styles.leftSection}>
        <p className={styles.sectionLabel}>
          ABOUT ME:
        </p>
        <h1 className={styles.mainTitle}>
           Software Engineer
        </h1>
         <div className={styles.skillsCarousel}>
          <div className={styles.skillsContainer}>
            {skills.map((skill) => (
              <span key={skill} className={styles.skill}>
                {skill}
              </span>
            ))}
            {skills.map((skill, index) => (
              <span key={`duplicate-${index}`} className={styles.skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.contentContainer}>
        <p className={styles.description}>
            I'm Anthony Lam, a fourth-year Software Engineering student at Western University who's absolutely hooked on turning
            complex problems into clean, user-friendly solutions. Whether I'm sketching out database schemas in SQL or prototyping
          UI flows in React, I love the puzzle of stitching together code, data, and design to build something that actually helps people.
        </p>
        <p className={styles.description}>
            Right now, I'm gearing up to join McGregor Allsop as a Database Developer Intern, where I'll dive into optimizing large-scale SQL systems.
          On the side, I lead a small team at Tech for Social Impact to build a React Native mental-health app—managing sprints in Jira,
            coordinating with stakeholders, and making sure our features land smoother than butter. Past projects include "Rate My School,"
          a full-stack platform powered by Spring Boot, PostgreSQL, and NeonDB, where I focused on ER-model design, API security, and real-time data updates.
        </p>
        <p className={styles.description}>
            Looking ahead, I'm on the hunt for more opportunities to bridge back-end robustness with front-end polish—think scalable cloud apps,
            data-driven dashboards, or anything that turns raw numbers into insights. When I'm not coding, you'll find me tinkering with new JS frameworks,
            geeking out over database indexing tricks, or sketching UI ideas on my iPad. Feel free to poke around my portfolio and GitHub—let's build something great together!
        </p>
        </div>
      </div>
      <div className={styles.rightSection}>
        <img src="./images/image.jpg" alt="Placeholder Image" className={styles.profileImage} />
      </div>
    </section>
  );
}
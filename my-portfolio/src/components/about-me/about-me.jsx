import styles from './about.module.css';
import ProfileCard from '../ui/ProfileCard/ProfileCard.jsx';
import FadeContent from '../ui/FadeContent';
import { 
  SiJavascript, 
  SiTypescript, 
  SiSpring, 
  SiExpress, 
  SiNextdotjs, 
  SiReact, 
  SiVite, 
  SiNodedotjs, 
  SiPostgresql 
} from 'react-icons/si';
import { 
  FaJava, 
  FaDatabase, 
  FaAws 
} from 'react-icons/fa';

const skills = [
  { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'Java', icon: FaJava, color: '#ED8B00' },
  { name: 'SQL', icon: FaDatabase, color: '#4479A1' },
  { name: 'Spring Boot', icon: SiSpring, color: '#6DB33F' },
  { name: 'Express.js', icon: SiExpress, color: '#000000' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
  { name: 'React', icon: SiReact, color: '#61DAFB' },
  { name: 'Vite', icon: SiVite, color: '#646CFF' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'Neon PostgreSQL', icon: SiPostgresql, color: '#336791' },
  { name: 'AWS', icon: FaAws, color: '#FF9900' },
];

export default function AboutMe() {
  return (
    <section className={styles.aboutContainer} id="about">
      <div className={styles.textSection}>
        <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
          <p className={styles.sectionLabel}>
            ABOUT ME:
          </p>
        </FadeContent>
        <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={100}>
          <h1 className={styles.mainTitle}>
             Software Engineer
          </h1>
        </FadeContent>
        {/* Keep carousel without FadeContent since you mentioned not to animate it */}
        <div className={styles.skillsCarousel}>
          <div className={styles.skillsContainer}>
            {skills.map((skill) => (
              <span key={skill.name} className={styles.skill}>
                <skill.icon className={styles.skillIcon} style={{ color: skill.color }} />
                {skill.name}
              </span>
            ))}
            {skills.map((skill, index) => (
              <span key={`duplicate-${index}`} className={styles.skill}>
                <skill.icon className={styles.skillIcon} style={{ color: skill.color }} />
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.contentContainer}>
          <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={200}>
            <p className={styles.description}>
              I'm Anthony Lam, a fourth-year Software Engineering student at Western University who's absolutely hooked on turning
              complex problems into clean, user-friendly solutions. Whether I'm sketching out database schemas in SQL or prototyping
              UI flows in React, I love the puzzle of stitching together code, data, and design to build something that actually helps people.
            </p>
          </FadeContent>
          <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={300}>
            <p className={styles.description}>
              Right now, I'm gearing up to join McGregor Allsop as a Database Developer Intern, where I'll dive into optimizing large-scale SQL systems.
              On the side, I lead a small team at Tech for Social Impact to build a React Native mental-health app—managing sprints in Jira,
              coordinating with stakeholders, and making sure our features land smoother than butter. Past projects include "Rate My School,"
              a full-stack platform powered by Spring Boot, PostgreSQL, and NeonDB, where I focused on ER-model design, API security, and real-time data updates.
            </p>
          </FadeContent>
          <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={400}>
            <p className={styles.description}>
              Looking ahead, I'm on the hunt for more opportunities to bridge back-end robustness with front-end polish—think scalable cloud apps,
              data-driven dashboards, or anything that turns raw numbers into insights. When I'm not coding, you'll find me tinkering with new JS frameworks,
              geeking out over database indexing tricks, or sketching UI ideas on my iPad. Feel free to poke around my portfolio and GitHub—let's build something great together!
            </p>
          </FadeContent>
        </div>
      </div>
      
      <div className={styles.imageSection}>
        {/* Keep ProfileCard without FadeContent since it's an image/interactive element */}
        <ProfileCard
          avatarUrl="./images/image.jpg"
          name="Anthony Lam"
          title="Software Engineer"
          handle="anthonylam"
          status="Available for hire"
          contactText="Let's Connect"
          showUserInfo={true}
          enableTilt={true}
        />
      </div>
    </section>
  );
}
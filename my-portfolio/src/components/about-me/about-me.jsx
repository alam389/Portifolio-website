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
              I'm Anthony Lam, a fourth-year Software Engineering student at Western University. I am passionate about anything designed and building applications that are challenging and a great learning opportunity. I don't like to stick to a specific technology stack, I am always looking to learn new things and improve my skills.
            </p>
          </FadeContent>
          <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={300}>
            <p className={styles.description}>
              Right now, I will be completing my fourth year of university and I will be working part-time as a Software Developer at McGregor Allsop.
              On the side, I am working on taking the AWS Developer Associate certification, and working on a few personal projects to improve my skills.
            </p>
          </FadeContent>
          <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={400}>
            <p className={styles.description}>
              Looking ahead, I'm on the hunt for more opportunities to learn new and emerging technologies to stay relevant in the industry. Possibly look into the Cloud development path to work with AWS or Azure and continue my work at Tech for Social Impact and build more projects to improve my skills.
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
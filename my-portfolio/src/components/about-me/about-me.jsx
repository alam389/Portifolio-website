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
    <section
        className="grid lg:grid-cols-[1.2fr_0.8fr] grid-cols-1 gap-4 lg:gap-8 xl:gap-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 box-border overflow-hidden" 
        id="about"
      >
        <div className="flex flex-col gap-4 lg:gap-6 min-w-0 overflow-wrap-break-word order-2 lg:order-1 text-left">
          <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
            <p className="text-xs sm:text-sm tracking-widest text-[#746c7a] m-0 uppercase">
              ABOUT ME:
            </p>
          </FadeContent>
          <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={100}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extralight leading-tight m-0 text-[#c0b5c9] font-['Inter','Helvetica_Neue',Arial,sans-serif] tracking-wide break-words">
               Software Engineer
            </h1>
          </FadeContent>
          {/* Skills carousel */}
          <div className="skills-carousel overflow-hidden relative w-full my-2 lg:my-4">
            <div className="skills-container inline-flex gap-3 whitespace-nowrap p-0">
              {skills.map((skill) => (
                <span key={skill.name} className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm bg-[rgba(192,181,201,0.1)] text-[#8c8493] transition-all duration-200 whitespace-nowrap hover:bg-[rgba(192,181,201,0.2)] hover:-translate-y-px hover:shadow-sm">
                  <skill.icon className="text-sm flex-shrink-0 transition-transform duration-200 hover:scale-110" style={{ color: skill.color }} />
                  {skill.name}
                </span>
              ))}
              {skills.map((skill, index) => (
                <span key={`duplicate-${index}`} className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm bg-[rgba(192,181,201,0.1)] text-[#8c8493] transition-all duration-200 whitespace-nowrap hover:bg-[rgba(192,181,201,0.2)] hover:-translate-y-px hover:shadow-sm">
                  <skill.icon className="text-sm flex-shrink-0 transition-transform duration-200 hover:scale-110" style={{ color: skill.color }} />
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:gap-4">
            <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={200}>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-[rgba(210,198,220,0.49)] m-0 overflow-wrap-break-word break-words hyphens-auto">
                I'm Anthony Lam, a fourth-year Software Engineering student at Western University who's absolutely hooked on turning
                complex problems into clean, user-friendly solutions. Whether I'm sketching out database schemas in SQL or prototyping
                UI flows in React, I love the puzzle of stitching together code, data, and design to build something that actually helps people.
              </p>
            </FadeContent>
            <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={300}>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-[rgba(210,198,220,0.49)] m-0 overflow-wrap-break-word break-words hyphens-auto">
                Right now, I'm gearing up to join McGregor Allsop as a Database Developer Intern, where I'll dive into optimizing large-scale SQL systems.
                On the side, I lead a small team at Tech for Social Impact to build a React Native mental-health app—managing sprints in Jira,
                coordinating with stakeholders, and making sure our features land smoother than butter. Past projects include "Rate My School,"
                a full-stack platform powered by Spring Boot, PostgreSQL, and NeonDB, where I focused on ER-model design, API security, and real-time data updates.
              </p>
            </FadeContent>
            <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={400}>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-[rgba(210,198,220,0.49)] m-0 overflow-wrap-break-word break-words hyphens-auto">
                Looking ahead, I'm on the hunt for more opportunities to bridge back-end robustness with front-end polish—think scalable cloud apps,
                data-driven dashboards, or anything that turns raw numbers into insights. When I'm not coding, you'll find me tinkering with new JS frameworks,
                geeking out over database indexing tricks, or sketching UI ideas on my iPad. Feel free to poke around my portfolio and GitHub—let's build something great together!
              </p>
            </FadeContent>
          </div>
        </div>
        
        <div className="flex justify-center items-start pt-4 lg:pt-8 min-w-0 order-1 lg:order-2">
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
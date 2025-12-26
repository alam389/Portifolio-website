import './App.css'
import AboutMe from './components/about-me/about-me.jsx'
import FeatureProjects from './components/feature-projects/projects.jsx'
import Experiences from './components/experiences/experiences.jsx'
import Contact from './components/contact/contacts.jsx'
import Footer from './components/footer/footer.jsx'
import Hero from './components/hero/Hero.jsx'
import Silk from './components/ui/silk.jsx'
import './styleslayout.css'

function App() {
  return (
    <>
      <div className="silk-background">
        <Silk 
          speed={5}
          scale={0.75}
          color="#7B7481" // You can customize the color to match your theme
          noiseIntensity={1.2}
          rotation={0.2}
        />
      </div>
      <main>
        <Hero />
        <AboutMe />
        <Experiences />
        <FeatureProjects/>
        <Contact />
        <Footer />
      </main>
    </>
  )
}

export default App

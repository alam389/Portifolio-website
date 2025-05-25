import Header from './components/header/header.jsx'
import './App.css'
import AboutMe from './components/about-me/about-me.jsx'
import FeatureProjects from './components/feature-projects/projects.jsx'
import Experiences from './components/experiences/experiences.jsx'
import Contact from './components/contact/contacts.jsx'
import Footer from './components/footer/footer.jsx'
function App() {

  return (
      <>
        <Header />
        <main>
          <AboutMe />
          <FeatureProjects/>
          <Experiences />
          <Contact />
          <Footer />
        </main>
      </>
  )
}

export default App

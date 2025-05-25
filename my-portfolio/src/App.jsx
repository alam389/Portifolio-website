import Header from './components/header/header.jsx'
import './App.css'
import AboutMe from './components/about-me/about-me.jsx'
import FeatureProjects from './components/feature-projects/projects.jsx'
function App() {

  return (
      <>
        <Header />
        <main>
          <AboutMe />
          <FeatureProjects />
        </main>
      </>
  )
}

export default App

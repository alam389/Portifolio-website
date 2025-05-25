import React, { useState } from 'react';
// Replace the missing styles with regular classes until you create a CSS module
// import styles from './projects.module.css';

// Add these temporary icon components until you create the actual ones
const Github = ({ size = 16 }) => (
  <span style={{ fontSize: size + 'px' }}>📂</span>
);

const ExternalLink = ({ size = 16 }) => (
  <span style={{ fontSize: size + 'px' }}>🔗</span>
);

export default function FeatureProjects() {
    const [currentProject, setCurrentProject] = useState(0);

    const projects = [
        {
        id: 1,
        title: "E-Commerce Platform",
        description:
            "A full-stack e-commerce solution built with React and Stripe integration. Features include user authentication, product management, shopping cart functionality, and secure payment processing.",
        date: "2024",
        services: "FULL-STACK DEVELOPMENT / PAYMENT INTEGRATION / UI/UX DESIGN",
        technologies: ["React", "JavaScript", "Stripe", "Node.js", "PostgreSQL"],
        image: "https://via.placeholder.com/1200x600/f3f4f6/6b7280?text=E-Commerce+Platform",
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

    // Get the current project based on the state
    const currentProj = projects[currentProject];

    // Function to navigate between projects
    const handleNextProject = () => {
        setCurrentProject((prev) => (prev + 1) % projects.length);
    };

    const handlePrevProject = () => {
        setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
    };

    return (
        <section className="feature-projects">
            <p>FEATURE PROJECTS:</p>
            
            {/* Project Navigation */}
            <div className="project-navigation">
                <button onClick={handlePrevProject} className="nav-button">Previous</button>
                <span>{currentProject + 1} of {projects.length}</span>
                <button onClick={handleNextProject} className="nav-button">Next</button>
            </div>
            
            {/* Featured Project */}
            <section className="project-section">
                <p className="section-label">PROJECT:</p>
                <h2 className="project-title">{currentProj.title}</h2>
                <p className="project-description">{currentProj.description}</p>

                <div className="project-meta">
                    <div className="meta-item">
                        <p className="meta-label">DATE:</p>
                        <p className="meta-value">{currentProj.date}</p>
                    </div>
                    <div className="meta-item">
                        <p className="meta-label">SERVICES:</p>
                        <p className="meta-value">{currentProj.services}</p>
                    </div>
                </div>

                <div className="technologies-section">
                    <p className="meta-label">TECHNOLOGIES:</p>
                    <div className="technologies-container">
                        {currentProj.technologies.map((tech) => (
                            <span key={tech} className="technology">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="image-container">
                    <img
                        src={currentProj.image || "/placeholder.svg"}
                        alt={currentProj.title}
                        className="project-image"
                    />
                </div>

                <div className="project-actions">
                    <a href={currentProj.github} target="_blank" rel="noopener noreferrer" className="primary-button">
                        <Github size={16} />
                        <span>View Code</span>
                    </a>
                    <a href={currentProj.live} target="_blank" rel="noopener noreferrer" className="secondary-button">
                        <ExternalLink size={16} />
                        <span>Live Demo</span>
                    </a>
                </div>    
            </section>
        </section>
    );
}
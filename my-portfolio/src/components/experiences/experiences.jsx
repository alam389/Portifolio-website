import React from 'react';

export default function Experiences() {
    // Sample experiences data - you can expand this with your actual experiences
    const experiences = [
        {
            company: "Tech Company XYZ",
            period: "Jan 2024 - Present",
            title: "Software Engineer Intern",
            description: "I have worked on various projects during my internship, focusing on backend development and database management. I have experience with Java, Spring Boot, Node.js, and PostgreSQL."
        },
        {
            company: "Startup ABC",
            period: "Jun 2023 - Dec 2023",
            title: "Web Development Intern",
            description: "Developed and maintained responsive web applications using React and Next.js. Collaborated with design team to implement UI/UX improvements."
        },
        {
            company: "University Project",
            period: "Jan 2023 - May 2023",
            title: "Team Lead",
            description: "Led a team of 4 students to develop a campus navigation app. Managed project timeline and delegated tasks while contributing to the frontend development."
        }
    ];

    return (
        <section className="experience-section">
            <h2 className="section-title">EXPERIENCE</h2>
            <div className="experience-grid">
                {experiences.map((exp, index) => (
                    <div key={index} className="experience-card">
                        <div className="experience-header">
                            <span className="experience-company">{exp.company}</span>
                            <span className="experience-period">{exp.period}</span>
                        </div>
                        <h3 className="experience-title">{exp.title}</h3>
                        <p className="experience-description">{exp.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
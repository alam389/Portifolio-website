import React from 'react';
import styles from './experiences.module.css';

export default function Experiences() {
    // Sample experiences data
    const experiences = [
        {
            title: "Database Developer",
            company: "McGregor Allsop",
            period: "May 2025 - August 2025",
            description: [
                "Worked with Microsoft SSMS to optimize workflow to support engineering and financial operations.",
                "Filtered, extracted, and organized large data sets using machine learning libraries for use by engineering and project management teams.",
                "Built and hosted database-driven applications using Java Springboot on their servers to streamline data entry for their engineers and added functionalities to their pre-existing system.",
                "Created customized financial reports and project tracking tools using SQL queries and programming scripts (Java, Python)."        
            ]
        },
        {
            title: "Project Manager",
            company: "Tech for Social Impact",
            period: "May 2024 - Present",
            description: [
                "Delivered a web traffic tracker solution for Boys and Girls Club London as measured by a 40% increase in visibility by leading a student team by seamless integration with Google Analytics.",
                "Managing a cross-functional team of 4 developers to design and develop a React Native-powered mental health app for EmpowerHERto, providing personalized wellness resources for minority girls.",
                "Led Agile project execution, fostering transparent stakeholder communication and ensuring iterative improvements aligned with user needs.",
                "Optimized sprint planning and backlog prioritization, reducing development roadblocks and increasing team efficiency through structured workflows in Jira."
            ]
        },
    ];

    return (
        <section className={styles.experienceSection} id="experience">
            <div className={styles.experienceContainer}>
                <h2 className={styles.sectionTitle}>EXPERIENCE:</h2>
                <h1 className={styles.journeyTitle}>Professional Journey</h1>
                
                <div className={styles.experienceList}>
                    {experiences.map((exp, index) => (
                        <div key={index} className={styles.experienceCard}>
                            <div className={styles.experienceHeader}>
                                <h3 className={styles.jobTitle}>{exp.title}</h3>
                                <span className={styles.period}>{exp.period}</span>
                            </div>
                            <p className={styles.companyName}>{exp.company}</p>
                            <ul className={styles.bulletPoints}>
                                {Array.isArray(exp.description) ? 
                                    exp.description.map((bullet, i) => (
                                        <li key={i} className={styles.bulletPoint}>{bullet}</li>
                                    )) : 
                                    <li className={styles.bulletPoint}>{exp.description}</li>
                                }
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
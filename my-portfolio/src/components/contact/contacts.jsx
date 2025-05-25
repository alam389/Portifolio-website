import React from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';

export default function Contact() {
    return (
        <section className="contact-section">
            <div className="contact-container">
                <p className="contact-label">CONTACT:</p>
                <h2 className="contact-heading">Let's Work Together</h2>
                
                <p className="contact-description">
                    I'm always interested in new opportunities and exciting projects. Whether you 
                    have a question or just want to say hi, feel free to reach out!
                </p>
                
                <div className="contact-buttons">
                    <a href="mailto:your.email@example.com" className="contact-button">
                        <Mail size={18} />
                        <span>Send Email</span>
                    </a>
                    
                    <a 
                        href="https://www.linkedin.com/in/anthony---lam/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="contact-button"
                    >
                        <Linkedin size={18} />
                        <span>LinkedIn</span>
                    </a>
                    
                    <a 
                        href="https://github.com/yourusername" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="contact-button"
                    >
                        <Github size={18} />
                        <span>GitHub</span>
                    </a>
                </div>
            </div>
        </section>
    );
}

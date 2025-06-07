import React, { useState } from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import styles from './contact.module.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // You would typically send this data to a backend service
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <section className={styles.contactSection} id="contact">
            <div className={styles.contactContainer}>
                <div className={styles.contactHeader}>
                    <p className={styles.contactLabel}>CONTACT:</p>
                    <h2 className={styles.contactHeading}>Let's chat</h2>
                </div>
                
                <div className={styles.contactContent}>
                    <div className={styles.contactLeft}>
                        <p className={styles.contactDescription}>
                            I'm always interested in new opportunities and exciting projects. If you have questions for want advice, or just want to chat, feel free to reach out.
                        </p>
                        
                        <div className={styles.contactButtons}>
                            <a href="mailto:mail@mail.com" className={styles.contactButton}>
                                <Mail size={18} />
                                <span>Send Email</span>
                            </a>
                            
                            <a 
                                href="https://www.linkedin.com/in/anthony---lam/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={styles.contactButton}
                            >
                                <Linkedin size={18} />
                                <span>LinkedIn</span>
                            </a>
                            
                            <a 
                                href="https://github.com/yourusername" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={styles.contactButton}
                            >
                                <Github size={18} />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>
                    
                    <div className={styles.contactRight}>
                        <form onSubmit={handleSubmit} className={styles.contactForm}>
                            <div className={styles.formGroup}>
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Name" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    required 
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <input 
                                    type="text" 
                                    name="subject" 
                                    placeholder="Subject" 
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <textarea 
                                    name="message" 
                                    placeholder="Message" 
                                    value={formData.message}
                                    onChange={handleChange}
                                    required 
                                    className={styles.formTextarea}
                                    rows="6"
                                ></textarea>
                            </div>
                            
                            <button type="submit" className={styles.submitButton}>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

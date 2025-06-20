import React, { useState } from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import styles from './contact.module.css';
import emailjs from '@emailjs/browser';

import FadeContent from '../ui/FadeContent';

export default function Contact() {
    const [isLoading , setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
        // Initialize EmailJS with your User ID
        emailjs.init('user_yLYI6joHYuHnt6mlb'); // Replace with your actual User ID

        // Option 1: Use emailjs.send() with template parameters
        const result = await emailjs.send(
            'service_ggb3jlh',    // Service ID
            'template_b3y318w',   // Template ID
            {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message,
                to_email: 'lamanthony167@gmail.com'
            },
            'user_yLYI6joHYuHnt6mlb'  // User ID as 4th parameter
        );


        console.log('Email sent successfully:', result);
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
        console.error('Email sending failed:', error);
        setStatus('error');
    } finally {
        setIsLoading(false);
    }
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
                    <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
                        <p className={styles.contactLabel}>CONTACT:</p>
                    </FadeContent>
                    <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={100}>
                        <h2 className={styles.contactHeading}>Let's chat</h2>
                    </FadeContent>
                </div>

                <div className={styles.contactContent}>
                    <div className={styles.contactLeft}>
                        <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={100}>
                        <p className={styles.contactDescription}>
                                I'm always interested in new opportunities and exciting projects. If you have questions for want advice, or just want to chat, feel free to reach out.
                            </p>
                        </FadeContent>
                        <div className={styles.contactButtons}>
                            <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
                                <a href="mailto:mail@mail.com" className={styles.contactButton}>
                                    <Mail size={18} />
                                    <span>Send Email</span>
                                </a>
                            </FadeContent>
                            <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={100}>
                                <a
                                    href="https://www.linkedin.com/in/anthony---lam/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.contactButton}
                                >
                                    <Linkedin size={18} />
                                    <span>LinkedIn</span>
                                </a>
                            </FadeContent>


                            <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
                                <a
                                    href="https://github.com/yourusername"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.contactButton}
                                >
                                    <Github size={18} />
                                    <span>GitHub</span>
                                </a>
                            </FadeContent>

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
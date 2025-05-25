import React from 'react';
import { Mail, Linkedin, Github } from 'lucide-react'; // Use 'Github' instead of 'GitHub'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <span className="footer-label">COPYRIGHT:</span>
          <span className="footer-text">©2024 YOUR NAME</span>
        </div>
        <div className="footer-section">
          <span className="footer-label">GITHUB:</span>
          <span className="footer-text">@YOURUSERNAME</span>
        </div>
        <div className="footer-section">
          <span className="footer-label">SAY HELLO:</span>
          <span className="footer-text">HEY@YOURNAME.COM</span>
        </div>
        <div className="footer-section">
          <span className="footer-label">LAST UPDATED:</span>
          <span className="footer-text">2024-01-15T10:30:00Z</span>
        </div>
      </div>

      <div className="contact-actions">
        <a href="mailto:your.email@example.com" className="contact-button">
          <Mail size={16} />
          <span>Email</span>
        </a>
        <a
          href="https://linkedin.com/in/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-button"
        >
          <Linkedin size={16} />
          <span>LinkedIn</span>
        </a>
        <a
          href="https://github.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-button"
        >
          <Github size={16} />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
}
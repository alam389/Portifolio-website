import React from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={`section-container ${styles.footer}`}>
      <div className={`content-wrapper ${styles.footerContent}`}>
        <div className={styles.footerSection}>
          <span className={styles.footerLabel}>COPYRIGHT:</span>
          <span className={styles.footerText}>©2025 Anthony Lam</span>
        </div>
        <div className={styles.footerSection}>
          <span className={styles.footerLabel}>GITHUB:</span>
          <span className={styles.footerText}>@alam389</span>
        </div>
        <div className={styles.footerSection}>
          <span className={styles.footerLabel}>SAY HELLO:</span>
          <span className={styles.footerText}>lamanthony167@gmail.com</span>
        </div>
        <div className={styles.footerSection}>
          <span className={styles.footerLabel}>LAST UPDATED:</span>
          <span className={styles.footerText}>2025-12-26T10:30:00Z</span>
        </div>
      </div>


    </footer>
  );
}
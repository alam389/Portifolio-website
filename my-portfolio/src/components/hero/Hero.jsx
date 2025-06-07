import React from 'react';
import styles from './hero.module.css';

export default function Hero() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.leftSection}>
        <h1 className={styles.name}>Anthony Lam</h1>
        <div className={styles.subtitle}>Designer &amp; Developer</div>
        <nav className={styles.menu}>
          <ul>
            <li className={styles.menuDot}>•</li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#info">Info</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.bio}>
          <p>
          <strong>Born in 1994<br />in Niagara, Canada.</strong><br />
Passionate about backend and database design.<br />
I believe robust backend systems are the backbone<br />
of every great application.<br />
My mission: build scalable, reliable solutions<br />
that power growth and never let you down.<br />
          </p>
        </div>
      </div>
    </div>
  );
} 
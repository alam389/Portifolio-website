import React from 'react';
import styles from './hero.module.css';
import FadeContent from '../ui/FadeContent';

export default function Hero() {
  return (
    <div className={styles.heroContainer}>
      <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={0} className={styles.leftSection}>
        <h1 className={styles.name}>Anthony Lam</h1>
        <div className={styles.subtitle}> Aspiring Software Engineer</div>
        <nav className={styles.menu}>
          <ul>
            <li className={styles.menuDot}>•</li>
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </FadeContent>
      <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0} delay={200} className={styles.rightSection}>
        <div className={styles.bio}>
          <p>
          <strong>Born in 2004<br />Niagara, Canada.</strong><br />
Passionate about Backend and Cloud Computing.<br />
I believe robust Backend systems are the backbone<br />
of every great application.<br />
My mission: build scalable, reliable solutions<br />
that power growth and never let you down.<br />
          </p>
        </div>
      </FadeContent>
    </div>
  );
} 
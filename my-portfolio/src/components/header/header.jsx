import styles from './header.module.css'
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Header({ prevProject, nextProject }) {
    return (
        <header className={styles.header}>
            <div className={styles.breadcrumb}>
                <span className={styles.breadcrumbItem}>HOME</span>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbItem}>PORTFOLIO</span>
            </div>
            <div className={styles.navigation}>
                <button onClick={prevProject} className={styles.navButton}>
                    <ChevronLeft size={16} />
                    PREVIOUS
                </button>
                <span className={styles.breadcrumbSeparator}>/</span>
                <button onClick={nextProject} className={styles.navButton}>
                    NEXT
                    <ChevronRight size={16} />
                </button>
            </div>
        </header>
    );
}
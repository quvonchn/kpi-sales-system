import React from 'react';
import styles from './FloatingFooter.module.css';

export default function FloatingFooter() {
    return (
        <div className={styles.wrapper}>
            <a
                href="https://t.me/quvonchbek_ai"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.advertContainer}
            >
                <span className={styles.text}>
                    Created by <span className={styles.name}>Quvonchbek</span>
                </span>
            </a>
        </div>
    );
}

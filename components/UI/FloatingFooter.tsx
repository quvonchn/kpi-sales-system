import React from 'react';
import styles from './FloatingFooter.module.css';

export default function FloatingFooter() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.advertContainer}>
                <span className={styles.text}>
                    Created by <span className={styles.name}>Quvonchbek</span>
                </span>
            </div>
        </div>
    );
}

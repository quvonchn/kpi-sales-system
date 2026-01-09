import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    current: number;
    max: number;
    label?: string;
}

export default function ProgressBar({ current, max, label }: ProgressBarProps) {
    const percentage = Math.min((current / max) * 100, 100);

    return (
        <div className={styles.container}>
            {label && (
                <div className={styles.labelRow}>
                    <span className={styles.label}>{label}</span>
                    <span className={styles.value}>{current} / {max}</span>
                </div>
            )}
            <div className={styles.track}>
                <div
                    className={styles.fill}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className={styles.percentage}>{Math.round(percentage)}%</div>
        </div>
    );
}

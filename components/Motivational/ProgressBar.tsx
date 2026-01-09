import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    current: number;
    max: number;
    label?: string;
    nextRate?: number;
    estimatedBonus?: string;
}

export default function ProgressBar({ current, max, label, nextRate, estimatedBonus }: ProgressBarProps) {
    const percentage = Math.min((current / max) * 100, 100);
    const roundedPercentage = Math.round(percentage);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>🎯</span>
                <div className={styles.titleGroup}>
                    <h3 className={styles.title}>Keyingi bosqich</h3>
                    <p className={styles.subtitle}>
                        Yana <strong>{max - current} ta</strong> savdo qilsangiz, KPI <span className={styles.highlight}>{nextRate}%</span> ga ko'tariladi
                    </p>
                </div>
            </div>

            <div className={styles.bonusRow}>
                <strong>Keyingi bosqichdagi tahminiy Bonus: {estimatedBonus}</strong>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.track}>
                    <div
                        className={styles.fill}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className={styles.stats}>
                    <span>{current} / {max}</span>
                    <span>{roundedPercentage}%</span>
                </div>
            </div>
        </div>
    );
}

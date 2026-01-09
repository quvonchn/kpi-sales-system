import React from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: string; // e.g. "+12%"
    color?: 'primary' | 'accent' | 'success';
}

export default function StatsCard({ title, value, subtitle, icon, trend, color = 'primary' }: StatsCardProps) {
    return (
        <div className={`card ${styles.container} ${styles[color]}`}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                {icon && <span className={styles.icon}>{icon}</span>}
            </div>
            <div className={styles.content}>
                <h3 className={styles.value}>{value}</h3>
                {trend && <span className={styles.trend}>{trend}</span>}
            </div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
}

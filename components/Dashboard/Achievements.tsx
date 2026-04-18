import React from 'react';
import styles from './Achievements.module.css';

interface AchievementProps {
    salesCount: number;
    totalRevenue: number;
}

export default function Achievements({ salesCount, totalRevenue }: AchievementProps) {
    const achievements = [
        {
            id: 'first_sale',
            icon: '🎯',
            title: 'Birinchi Qadam',
            description: 'Kamida 1 ta sotuv',
            unlocked: salesCount >= 1
        },
        {
            id: 'high_five',
            icon: '✋',
            title: 'Yuqori Beshlik',
            description: '5 ta sotuv amalga oshirildi',
            unlocked: salesCount >= 5
        },
        {
            id: 'pro_seller',
            icon: '🔥',
            title: 'Pro Sotuvchi',
            description: '10 ta sotuv amalga oshirildi',
            unlocked: salesCount >= 10
        },
        {
            id: 'revenue_king',
            icon: '👑',
            title: 'Daromad Qiroli',
            description: '100M+ so\'mlik sotuv',
            unlocked: totalRevenue >= 100000000
        }
    ];

    return (
        <div className={`card ${styles.container}`}>
            <h3 className={styles.title}>🎖 Yutuqlarim</h3>
            <div className={styles.grid}>
                {achievements.map((ach) => (
                    <div 
                        key={ach.id} 
                        className={`${styles.achievement} ${ach.unlocked ? styles.unlocked : styles.locked}`}
                        title={ach.description}
                    >
                        <div className={styles.icon}>{ach.icon}</div>
                        <div className={styles.info}>
                            <span className={styles.achTitle}>{ach.title}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import styles from './Header.module.css';
import { useAuth } from '@/lib/auth/useAuth';

export default function Header() {
    const { operator, loading } = useAuth();

    if (loading) return <div className={styles.header}>Yuklanmoqda...</div>;

    const displayName = operator || 'Mehmon';

    return (
        <header className={styles.header}>
            <div className={styles.welcome}>
                <h1 className={styles.title}>Xush kelibsiz, {displayName}!</h1>
                <p className={styles.date}>
                    {new Date().toLocaleDateString('uz-UZ', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>
            <div className={styles.userProfile}>
                <div className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
            </div>
        </header>
    );
}

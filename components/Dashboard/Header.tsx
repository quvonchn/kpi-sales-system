'use client';

import React from 'react';
import styles from './Header.module.css';
import { useAuth } from '@/lib/auth/useAuth';
import { useSidebar } from '@/context/SidebarContext';

export default function Header() {
    const { operator, loading } = useAuth();
    const { toggleSidebar } = useSidebar();

    if (loading) return <div className={styles.header}>Yuklanmoqda...</div>;

    const displayName = operator || 'Mehmon';

    return (
        <header className={styles.header}>
            <div className={styles.welcomeGroup}>
                <button
                    className={styles.menuButton}
                    onClick={toggleSidebar}
                    aria-label="Menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div className={styles.headerLogo}>
                    <svg width="34" height="34" viewBox="0 10 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.89648 30.9747C3.89648 29.3041 5.32203 27.9496 7.08055 27.9496H30.4304C32.189 27.9496 33.6145 29.3041 33.6145 30.9747C33.6145 32.6456 32.189 34.0001 30.4304 34.0001H7.08055C5.32203 34.0001 3.89648 32.6456 3.89648 30.9747Z" fill="var(--primary)" />
                        <path d="M16.7608 0.895816C17.9976 -0.298605 20.0025 -0.298605 21.2391 0.895816L37.0726 16.1883C38.3091 17.3828 38.3091 19.3193 37.0726 20.5137C35.8359 21.7082 33.8309 21.7082 32.5942 20.5137L19 7.38388L5.40584 20.5137C4.16918 21.7082 2.16416 21.7082 0.927497 20.5137C-0.309166 19.3193 -0.309166 17.3828 0.927497 16.1883L16.7608 0.895816Z" fill="var(--primary)" />
                        <circle cx="18.9" cy="19.9" r="4.9" fill="var(--accent)" />
                    </svg>
                </div>
                <div className={styles.welcome}>
                    <h1 className={styles.title}>Xush kelibsiz, {displayName}!</h1>
                    <p className={styles.date}>
                        {(() => {
                            const d = new Date();
                            const day = String(d.getDate()).padStart(2, '0');
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const year = d.getFullYear();
                            return `${day}.${month}.${year}`;
                        })()}
                    </p>
                </div>
            </div>
            <div className={styles.userProfile}>
                <div className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
                <span className={styles.operatorLabel}>Operator</span>
            </div>
        </header>
    );
}

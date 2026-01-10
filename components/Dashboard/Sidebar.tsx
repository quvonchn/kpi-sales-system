'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        const operator = localStorage.getItem('operator');
        setIsAdmin(operator?.toLowerCase() === 'admin');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('operator');
        router.push('/login');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <svg width="34" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.89648 30.9747C3.89648 29.3041 5.32203 27.9496 7.08055 27.9496H30.4304C32.189 27.9496 33.6145 29.3041 33.6145 30.9747C33.6145 32.6456 32.189 34.0001 30.4304 34.0001H7.08055C5.32203 34.0001 3.89648 32.6456 3.89648 30.9747Z" fill="white" />
                        <path d="M16.7608 0.895816C17.9976 -0.298605 20.0025 -0.298605 21.2391 0.895816L37.0726 16.1883C38.3091 17.3828 38.3091 19.3193 37.0726 20.5137C35.8359 21.7082 33.8309 21.7082 32.5942 20.5137L19 7.38388L5.40584 20.5137C4.16918 21.7082 2.16416 21.7082 0.927497 20.5137C-0.309166 19.3193 -0.309166 17.3828 0.927497 16.1883L16.7608 0.895816Z" fill="white" />
                        <circle cx="18.9" cy="19.9" r="4.9" fill="var(--accent)" />
                    </svg>
                </div>
                <span className={styles.logoText}>UYSOT <span className={styles.kpiTag}>KPI</span></span>
            </div>

            <nav className={styles.nav}>
                <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
                    <span>🏠 Dashboard</span>
                </Link>
                <Link href="/history" className={`${styles.navItem} ${pathname === '/history' ? styles.active : ''}`}>
                    <span>📜 Sotuv Tarixi</span>
                </Link>
                <Link href="/ranking" className={`${styles.navItem} ${pathname === '/ranking' ? styles.active : ''}`}>
                    <span>🏆 Reyting</span>
                </Link>
                <Link href="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`}>
                    <span>👤 Profil</span>
                </Link>
                <Link href="/kpi" className={`${styles.navItem} ${pathname === '/kpi' ? styles.active : ''}`}>
                    <span>📊 KPI Tafsilotlari</span>
                </Link>
                {isAdmin && (
                    <Link href="/admin" className={`${styles.navItem} ${styles.adminLink} ${pathname === '/admin' ? styles.active : ''}`}>
                        <span>⚙️ Admin Panel</span>
                    </Link>
                )}
            </nav>

            <div className={styles.footer}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <span>🚪 Chiqish</span>
                </button>
            </div>
        </aside>
    );
}

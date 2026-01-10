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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

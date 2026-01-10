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
                <div className={styles.logoIcon}>KPI</div>
                <span className={styles.logoText}>Dashboard</span>
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

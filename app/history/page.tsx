'use client';

import React, { useEffect, useState } from 'react';
import styles from '../page.module.css'; // Reuse dashboard styles
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import RecentSales from '@/components/Dashboard/RecentSales';

export default function HistoryPage() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const operator = localStorage.getItem('operator');
                const response = await fetch(`/api/sales?operator=${operator}`);
                const data = await response.json();
                setSales(data.sales || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />
                    <div className="card" style={{ marginTop: '2rem' }}>
                        <h2>Sotuvlar Tarixi</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Barcha amalga oshirilgan sotuvlar ro'yxati</p>
                        <RecentSales sales={sales} />
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

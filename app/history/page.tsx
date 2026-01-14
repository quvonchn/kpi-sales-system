'use client';

import React, { useEffect, useState } from 'react';
import styles from '../page.module.css'; // Reuse dashboard styles
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import RecentSales from '@/components/Dashboard/RecentSales';
import StatusPieChart from '@/components/Dashboard/StatusPieChart';

interface Sale {
    id: string;
    amount: number;
    product: string;
    time: string;
    quruvchi: string;
    status: string;
}

export default function HistoryPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

    const displayedSales = statusFilter
        ? sales.filter(s => s.status === statusFilter)
        : sales;

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Yuklanmoqda...</div>;
    }

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />

                    <div className={styles.dashboardGrid}>
                        <div className={styles.pageTitle}>
                            <h1>Sotuvlar Tarixi</h1>
                            <p>Barcha amalga oshirilgan sotuvlar ro'yxati</p>
                        </div>

                        <section className={styles.contentRow}>
                            <RecentSales
                                sales={displayedSales}
                                activeFilter={statusFilter}
                                hideBuilder={false}
                                hideAmount={true}
                            />
                            <StatusPieChart
                                sales={sales}
                                onFilterChange={setStatusFilter}
                                activeFilter={statusFilter}
                            />
                        </section>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

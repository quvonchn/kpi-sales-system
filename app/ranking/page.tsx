'use client';

import { useEffect, useState } from 'react';
import styles from './ranking.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';

interface OperatorStat {
    name: string;
    email: string;
    salesCount: number;
    totalRevenue: number;
    commissionRate: number;
    commissionAmount: number;
}

export default function RankingPage() {
    const [operators, setOperators] = useState<OperatorStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'revenue' | 'sales'>('revenue');

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                setOperators(data.operators || []);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const sortedOperators = [...operators].sort((a, b) => {
        if (sortBy === 'revenue') {
            return b.totalRevenue - a.totalRevenue;
        } else {
            return b.salesCount - a.salesCount;
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div className={styles.loading}>Yuklanmoqda...</div>;
    }

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />
                    <div className={styles.header}>
                        <div>
                            <h1>Operatorlar Reytingi</h1>
                            <p>Eng yaxshi natija ko'rsatayotgan hamkasblarimiz</p>
                        </div>
                        <div className={styles.filterGroup}>
                            <label htmlFor="sort">Saralash:</label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'revenue' | 'sales')}
                                className={styles.select}
                            >
                                <option value="revenue">KPI summasi bo'yicha</option>
                                <option value="sales">Sotilgan uy soni bo'yicha</option>
                            </select>
                        </div>
                    </div>

                    <div className={`card ${styles.tableCard}`}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Operator</th>
                                        <th>Sotuvlar</th>
                                        <th>Daromad</th>
                                        <th>Komissiya %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedOperators.map((op, index) => (
                                        <tr key={op.name}>
                                            <td className={styles.rank}>
                                                {index === 0 && '🥇'}
                                                {index === 1 && '🥈'}
                                                {index === 2 && '🥉'}
                                                {index > 2 && index + 1}
                                            </td>
                                            <td className={styles.name}>{op.name}</td>
                                            <td className={styles.sales}>{op.salesCount}</td>
                                            <td>{formatCurrency(op.totalRevenue)}</td>
                                            <td className={styles.rate}>{(op.commissionRate * 100).toFixed(0)}%</td>
                                        </tr>
                                    ))}
                                    {operators.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className={styles.empty}>Ma'lumot yo'q</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

'use client';

import { useEffect, useState } from 'react';
import styles from './ranking.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import OperatorSalesModal from '@/components/Dashboard/OperatorSalesModal';

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
    const [sortBy, setSortBy] = useState<'kpi' | 'sales'>('kpi');
    const [isAdmin, setIsAdmin] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const [operatorSales, setOperatorSales] = useState<any[]>([]);
    const [loadingSales, setLoadingSales] = useState(false);

    useEffect(() => {
        const checkAdmin = () => {
            const operator = localStorage.getItem('operator');
            setIsAdmin(operator?.trim().toLowerCase() === 'admin');
        };

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

        checkAdmin();
        fetchStats();
    }, []);

    const handleRowClick = async (operatorName: string) => {
        if (!isAdmin) return;

        setSelectedOperator(operatorName);
        setIsModalOpen(true);
        setLoadingSales(true);

        try {
            // Using the existing history API to fetch all current month sales for this operator
            const response = await fetch(`/api/sales/history?operator=${encodeURIComponent(operatorName)}`);
            const data = await response.json();
            setOperatorSales(data.sales || []);
        } catch (error) {
            console.error('Error fetching operator sales:', error);
            setOperatorSales([]);
        } finally {
            setLoadingSales(false);
        }
    };

    const sortedOperators = [...operators].sort((a, b) => {
        if (sortBy === 'kpi') {
            return b.commissionAmount - a.commissionAmount;
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
                                onChange={(e) => setSortBy(e.target.value as 'kpi' | 'sales')}
                                className={styles.select}
                            >
                                <option value="sales">Sotuvlar soni bo'yicha</option>
                                <option value="kpi">KPI summasi bo'yicha</option>
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
                                        <th>Sotuvlar soni</th>
                                        <th>KPI summasi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedOperators.map((op, index) => (
                                        <tr
                                            key={op.name}
                                            onClick={() => handleRowClick(op.name)}
                                            className={isAdmin ? styles.clickableRow : ''}
                                        >
                                            <td className={styles.rank}>
                                                {index === 0 && '🥇'}
                                                {index === 1 && '🥈'}
                                                {index === 2 && '🥉'}
                                                {index > 2 && index + 1}
                                            </td>
                                            <td className={styles.name}>{op.name}</td>
                                            <td className={styles.sales}>{op.salesCount}</td>
                                            <td>{formatCurrency(op.commissionAmount)}</td>
                                        </tr>
                                    ))}
                                    {operators.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className={styles.empty}>Ma'lumot yo'q</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <OperatorSalesModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        operatorName={selectedOperator}
                        sales={operatorSales}
                        loading={loadingSales}
                    />
                </main>
            </div>
        </AuthGuard>
    );
}

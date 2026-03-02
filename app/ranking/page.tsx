'use client';

import { useEffect, useState } from 'react';
import styles from './ranking.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import OperatorSalesModal from '@/components/Dashboard/OperatorSalesModal';
import AdminFilter from '@/components/Dashboard/AdminFilter';

interface OperatorStat {
    name: string;
    email: string;
    salesCount: number;
    totalRevenue: number;
    commissionAmount: number;
}

export default function RankingPage() {
    const [operators, setOperators] = useState<OperatorStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'kpi' | 'sales'>('kpi');
    const [isAdmin, setIsAdmin] = useState(false);

    // Filter State
    const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
    const [selectedOps, setSelectedOps] = useState<string[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const [operatorSales, setOperatorSales] = useState<any[]>([]);
    const [loadingSales, setLoadingSales] = useState(false);

    async function fetchStats(month?: number) {
        setLoading(true);
        try {
            const query = month ? `?month=${month}` : '';
            const response = await fetch(`/api/admin/stats${query}`);
            const data = await response.json();
            setOperators(data.operators || []);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const checkAdmin = () => {
            const operator = localStorage.getItem('operator');
            setIsAdmin(operator?.trim().toLowerCase() === 'admin');
        };

        checkAdmin();
        fetchStats(filterMonth);
    }, [filterMonth]);

    const handleApplyFilters = (filters: { month?: number; sortBy: 'kpi' | 'sales' }) => {
        setFilterMonth(filters.month);
        setSortBy(filters.sortBy);
    };

    // Filter by operator names - Removed as per instruction
    // const filteredByOps = selectedOps.length > 0
    //     ? operators.filter(op => selectedOps.includes(op.name))
    //     : operators;

    const sortedOperators = [...operators].sort((a, b) => {
        if (sortBy === 'kpi') {
            return b.commissionAmount - a.commissionAmount;
        } else {
            return b.salesCount - a.salesCount;
        }
    });

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
                        <div className={styles.titleSection}>
                            <h1>Operatorlar Reytingi</h1>
                            <p>Eng yaxshi natija ko'rsatayotgan hamkasblarimiz</p>
                        </div>

                        <div className={styles.controls}>
                            <AdminFilter
                                onApply={handleApplyFilters}
                                initialFilters={{ month: filterMonth, sortBy: sortBy }}
                            />
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

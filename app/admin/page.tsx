'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import AdminTrendChart from '@/components/Dashboard/AdminTrendChart';
import AdminFilter from '@/components/Dashboard/AdminFilter';

interface OperatorStat {
    name: string;
    email: string;
    salesCount: number;
    totalRevenue: number;
    commissionRate: number;
    commissionAmount: number;
}

interface Totals {
    totalOperators: number;
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
}

export default function AdminPage() {
    const [operators, setOperators] = useState<OperatorStat[]>([]);
    const [totals, setTotals] = useState<Totals | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'revenue' | 'sales'>('revenue');

    // Filter State
    const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
    const [selectedOps, setSelectedOps] = useState<string[]>([]);

    const router = useRouter();

    async function fetchStats(month?: number) {
        setLoading(true);
        try {
            const query = month ? `?month=${month}` : '';
            const response = await fetch(`/api/admin/stats${query}`);
            const data = await response.json();
            setOperators(data.operators || []);
            setTotals(data.totals || null);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Check if user is admin
        const currentUser = localStorage.getItem('operator');
        if (currentUser?.toLowerCase() !== 'admin') {
            router.push('/');
            return;
        }

        fetchStats(filterMonth);
    }, [router, filterMonth]);

    const handleApplyFilters = (filters: { month?: number; operators: string[] }) => {
        setFilterMonth(filters.month);
        setSelectedOps(filters.operators);
    };

    // Filter by operator names if any selected
    const filteredByOps = selectedOps.length > 0
        ? operators.filter(op => selectedOps.includes(op.name))
        : operators;

    const sortedOperators = [...filteredByOps].sort((a, b) => {
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
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                <div className={styles.header}>
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Barcha operatorlar statistikasi</p>
                    </div>
                    <AdminFilter
                        availableOperators={operators.map(op => op.name)}
                        onApply={handleApplyFilters}
                        initialFilters={{ month: filterMonth, operators: selectedOps }}
                    />
                </div>

                {/* Summary Cards */}
                {totals && (
                    <div className={styles.summaryGrid}>
                        <div className={`card ${styles.summaryCard}`}>
                            <div className={styles.cardIcon}>👥</div>
                            <div>
                                <h3>{totals.totalOperators}</h3>
                                <p>Jami Operatorlar</p>
                            </div>
                        </div>
                        <div className={`card ${styles.summaryCard}`}>
                            <div className={styles.cardIcon}>🛒</div>
                            <div>
                                <h3>{totals.totalSales}</h3>
                                <p>Jami Sotuvlar</p>
                            </div>
                        </div>
                        <div className={`card ${styles.summaryCard}`}>
                            <div className={styles.cardIcon}>💰</div>
                            <div>
                                <h3>{formatCurrency(totals.totalRevenue)}</h3>
                                <p>Jami Daromad</p>
                            </div>
                        </div>
                        <div className={`card ${styles.summaryCard}`}>
                            <div className={styles.cardIcon}>💵</div>
                            <div>
                                <h3>{formatCurrency(totals.totalCommission)}</h3>
                                <p>Jami Komissiya</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trend Line Chart */}
                <AdminTrendChart />

                {/* Operators Table */}
                <div className={`card ${styles.tableCard}`}>
                    <div className={styles.tableHeader}>
                        <h2>Operatorlar Reytingi</h2>
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
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Operator</th>
                                    <th>Email</th>
                                    <th>Sotuvlar</th>
                                    <th>Daromad</th>
                                    <th>Komissiya %</th>
                                    <th>KPI</th>
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
                                        <td className={styles.email}>{op.email || '-'}</td>
                                        <td className={styles.sales}>{op.salesCount}</td>
                                        <td>{formatCurrency(op.totalRevenue)}</td>
                                        <td className={styles.rate}>{(op.commissionRate * 100).toFixed(0)}%</td>
                                        <td className={styles.commission}>{formatCurrency(op.commissionAmount)}</td>
                                    </tr>
                                ))}
                                {operators.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className={styles.empty}>Ma'lumot yo'q</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

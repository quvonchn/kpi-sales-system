'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import styles from './admin.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import AdminTrendChart from '@/components/Dashboard/AdminTrendChart';
import AdminFilter from '@/components/Dashboard/AdminFilter';
import AuthGuard from '@/components/Auth/AuthGuard';

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
    const { operator, role } = useAuth();
    const [operators, setOperators] = useState<OperatorStat[]>([]);
    const [totals, setTotals] = useState<Totals | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'kpi' | 'sales'>('kpi');
    const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        // Double check admin role
        if (role && role !== 'admin') {
            router.push('/');
            return;
        }

        if (!operator) return;


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

        fetchStats(filterMonth);
    }, [operator, role, router, filterMonth]);

    const handleApplyFilters = (filters: { month?: number; sortBy: 'kpi' | 'sales' }) => {
        setFilterMonth(filters.month);
        setSortBy(filters.sortBy);
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
                    <div className={styles.header}>
                        <h1>Admin Panel</h1>
                        <p>Barcha operatorlar statistikasi</p>
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
                                <AdminFilter
                                    onApply={handleApplyFilters}
                                    initialFilters={{ month: filterMonth, sortBy }}
                                />
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
        </AuthGuard>
    );
}


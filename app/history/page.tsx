'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import styles from '../page.module.css';
import historyStyles from './history.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import MonthFilter from '@/components/Dashboard/MonthFilter';
import AdminFilterPopover from '@/components/Dashboard/AdminFilterPopover';
import SalesHistoryTable from '@/components/Dashboard/SalesHistoryTable';
import AdminSalesHistoryTable from '@/components/Dashboard/AdminSalesHistoryTable';
import KPIPieChart from '@/components/Dashboard/KPIPieChart';

interface Sale {
    id: string;
    operator: string;
    amount: number;
    product: string;
    time: string;
    quruvchi: string;
    status: string;
}

const MONTH_NAMES = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export default function HistoryPage() {
    const { operator, role } = useAuth();
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear] = useState(currentYear);
    const [isAdmin, setIsAdmin] = useState(false);

    // Admin Filter States
    const [adminFilters, setAdminFilters] = useState<{
        startDate?: string;
        endDate?: string;
        operators: string[];
        builder?: string;
    }>({ operators: [] });

    const [availableOperators, setAvailableOperators] = useState<string[]>([]);
    const [availableBuilders, setAvailableBuilders] = useState<string[]>([]);

    useEffect(() => {
        setIsAdmin(role === 'admin');

        async function fetchData() {
            if (!operator) return;
            setLoading(true);
            try {
                if (role === 'admin') {
                    // Admin Fetch Logic
                    const params = new URLSearchParams();
                    if (adminFilters.startDate) params.append('startDate', adminFilters.startDate);
                    if (adminFilters.endDate) params.append('endDate', adminFilters.endDate);
                    if (adminFilters.operators.length > 0) params.append('operators', adminFilters.operators.join(','));
                    if (adminFilters.builder) params.append('builder', adminFilters.builder);

                    const response = await fetch(`/api/admin/sales/filter?${params.toString()}`);
                    const data = await response.json();

                    setSales(data.sales || []);
                    if (data.metadata) {
                        setAvailableOperators(data.metadata.uniqueOperators || []);
                        setAvailableBuilders(data.metadata.uniqueBuilders || []);
                    }
                } else {
                    // Operator Fetch Logic
                    const response = await fetch(
                        `/api/sales/history?operator=${operator}&month=${selectedMonth}&year=${selectedYear}`
                    );
                    const data = await response.json();
                    setSales(data.sales || []);
                }
            } catch (e) {
                console.error(e);
                setSales([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedMonth, selectedYear, adminFilters, operator, role]);


    const handleMonthChange = (month: number) => {
        setSelectedMonth(month);
    };

    const isFutureMonth = selectedMonth > currentMonth && selectedYear === currentYear;

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />

                    <div className={styles.dashboardGrid}>
                        <div className={styles.pageTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>Savdolar Tarixi</h1>
                                <p>{isAdmin ? "Barcha savdolar va filtrlash imkoniyati" : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} - oylik tahlil`}</p>
                            </div>
                            {isAdmin && (
                                <AdminFilterPopover
                                    onApplyFilters={setAdminFilters}
                                    availableOperators={availableOperators}
                                    availableBuilders={availableBuilders}
                                    initialFilters={adminFilters}
                                />
                            )}
                        </div>

                        {!isAdmin && (
                            <MonthFilter
                                selectedMonth={selectedMonth}
                                onMonthChange={handleMonthChange}
                                currentYear={selectedYear}
                            />
                        )}

                        {!isAdmin && isFutureMonth ? (
                            <div className={historyStyles.emptyState}>
                                <div className={historyStyles.emptyIcon}>📅</div>
                                <h3>Bu oyda hali savdo mavjud emas</h3>
                                <p>{MONTH_NAMES[selectedMonth - 1]} oyi hali kelmagan</p>
                            </div>
                        ) : loading ? (
                            <div className={historyStyles.loading}>
                                <div className={historyStyles.spinner}></div>
                                <p>Yuklanmoqda...</p>
                            </div>
                        ) : (
                            <section className={styles.contentRow}>
                                {isAdmin ? (
                                    <AdminSalesHistoryTable sales={sales} />
                                ) : (
                                    <SalesHistoryTable sales={sales} />
                                )}
                                <KPIPieChart sales={sales} />
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

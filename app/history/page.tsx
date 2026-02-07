'use client';

import React, { useEffect, useState } from 'react';
import styles from '../page.module.css';
import historyStyles from './history.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import MonthFilter from '@/components/Dashboard/MonthFilter';
import SalesHistoryTable from '@/components/Dashboard/SalesHistoryTable';
import KPIPieChart from '@/components/Dashboard/KPIPieChart';

interface Sale {
    id: string;
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
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear] = useState(currentYear);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const operator = localStorage.getItem('operator');
                const response = await fetch(
                    `/api/sales/history?operator=${operator}&month=${selectedMonth}&year=${selectedYear}`
                );
                const data = await response.json();
                setSales(data.sales || []);
            } catch (e) {
                console.error(e);
                setSales([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedMonth, selectedYear]);

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
                        <div className={styles.pageTitle}>
                            <h1>Savdolar Tarixi</h1>
                            <p>{MONTH_NAMES[selectedMonth - 1]} {selectedYear} - oylik tahlil</p>
                        </div>

                        <MonthFilter
                            selectedMonth={selectedMonth}
                            onMonthChange={handleMonthChange}
                            currentYear={selectedYear}
                        />

                        {isFutureMonth ? (
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
                                <SalesHistoryTable sales={sales} />
                                <KPIPieChart sales={sales} />
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

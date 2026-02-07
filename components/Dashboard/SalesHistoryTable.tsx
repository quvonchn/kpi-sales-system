import React from 'react';
import styles from './SalesHistoryTable.module.css';
import { calculateCommission } from '@/utils/commission';

interface Sale {
    id: number | string;
    amount: number;
    product: string;
    time: string;
    quruvchi: string;
    status: string;
}

interface SalesHistoryTableProps {
    sales: Sale[];
}

const statusLabels: Record<string, string> = {
    'tasdiqlandi': 'Tasdiqlandi',
    'yangi': 'Yangi',
    'jarayonda': 'Jarayonda',
    'tasdiqlanmadi': 'Tasdiqlanmadi',
    'bekor qilindi': 'Bekor qilindi'
};

const statusColors: Record<string, string> = {
    'tasdiqlandi': 'statusApproved',
    'yangi': 'statusNew',
    'jarayonda': 'statusPending',
    'tasdiqlanmadi': 'statusRejected',
    'bekor qilindi': 'statusCancelled'
};

export default function SalesHistoryTable({ sales }: SalesHistoryTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate KPI based on confirmed sales using the commission algorithm
    const confirmedSales = sales.filter(s => s.status === 'tasdiqlandi');
    const confirmedCount = confirmedSales.length;
    const totalRevenue = confirmedSales.reduce((sum, s) => sum + s.amount, 0);
    const kpiData = calculateCommission(confirmedCount, totalRevenue);

    // Current KPI rate based on total confirmed sales count
    const currentRate = kpiData.commissionRate;
    const ratePercent = (currentRate * 100).toFixed(0);

    return (
        <div className={`card ${styles.container}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>Sotuvlar Jadvali</h3>
                <div className={styles.statsRow}>
                    <div className={styles.statBadge}>
                        <span className={styles.statLabel}>Sotuvlar:</span>
                        <span className={styles.statValue}>{confirmedCount} ta</span>
                    </div>
                    <div className={styles.statBadge}>
                        <span className={styles.statLabel}>Foiz:</span>
                        <span className={styles.statValue}>{ratePercent}%</span>
                    </div>
                    <div className={styles.totalBadge}>
                        <span className={styles.statLabel}>Jami KPI:</span>
                        <span className={styles.statValue}>{formatCurrency(kpiData.commissionAmount)}</span>
                    </div>
                </div>
            </div>
            <div className={styles.tableReflow}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Sana</th>
                            <th>Obyekt</th>
                            <th>Quruvchi</th>
                            <th>KPI ({ratePercent}%)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => {
                            // Calculate this sale's KPI contribution based on current rate
                            const saleKPI = sale.status === 'tasdiqlandi'
                                ? sale.amount * currentRate
                                : 0;

                            return (
                                <tr key={sale.id}>
                                    <td className={styles.time}>{sale.time}</td>
                                    <td className={styles.product}>{sale.product}</td>
                                    <td className={styles.builder}>{sale.quruvchi || "Noma'lum"}</td>
                                    <td className={styles.amount}>
                                        {sale.status === 'tasdiqlandi'
                                            ? formatCurrency(saleKPI)
                                            : <span className={styles.pending}>—</span>
                                        }
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[statusColors[sale.status] || 'statusNew']}`}>
                                            {statusLabels[sale.status] || sale.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.empty}>
                                    Bu oyda sotuvlar mavjud emas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {confirmedCount > 0 && (
                <div className={styles.footer}>
                    <p className={styles.note}>
                        💡 Har bir sotuv joriy {ratePercent}% foiz bilan hisoblanadi.
                        Savdo soni oshsa, barcha sotuvlar yangi foiz bilan qayta hisoblanadi.
                    </p>
                </div>
            )}
        </div>
    );
}

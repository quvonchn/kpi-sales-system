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

    return (
        <div className={`card ${styles.container}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>Sotuvlar Jadvali</h3>
                <div className={styles.statsRow}>
                    <div className={styles.statBadge}>
                        <span className={styles.statLabel}>Sotuvlar:</span>
                        <span className={styles.statValue}>{confirmedCount} ta</span>
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
                            <th>Quruvchi</th>
                            <th>Obyekt</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td className={styles.time}>{sale.time}</td>
                                <td className={styles.builder}>{sale.quruvchi || "Noma'lum"}</td>
                                <td className={styles.product}>{sale.product}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[statusColors[sale.status] || 'statusNew']}`}>
                                        {statusLabels[sale.status] || sale.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={4} className={styles.empty}>
                                    Bu oyda sotuvlar mavjud emas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

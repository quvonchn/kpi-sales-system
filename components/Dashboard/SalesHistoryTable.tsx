import React from 'react';
import styles from './SalesHistoryTable.module.css';

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
    confirmedOnly?: boolean;
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

export default function SalesHistoryTable({ sales, confirmedOnly = false }: SalesHistoryTableProps) {
    const displayedSales = confirmedOnly
        ? sales.filter(s => s.status === 'tasdiqlandi')
        : sales;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const totalKPI = displayedSales
        .filter(s => s.status === 'tasdiqlandi')
        .reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className={`card ${styles.container}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>Sotuvlar Jadvali</h3>
                <div className={styles.totalBadge}>
                    Jami KPI: {formatCurrency(totalKPI)}
                </div>
            </div>
            <div className={styles.tableReflow}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Sana</th>
                            <th>KPI Summasi</th>
                            <th>Quruvchi</th>
                            <th>Obyekt</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedSales.map((sale) => (
                            <tr key={sale.id}>
                                <td className={styles.time}>{sale.time}</td>
                                <td className={styles.amount}>{formatCurrency(sale.amount)}</td>
                                <td className={styles.builder}>{sale.quruvchi || "Noma'lum"}</td>
                                <td className={styles.product}>{sale.product}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[statusColors[sale.status] || 'statusNew']}`}>
                                        {statusLabels[sale.status] || sale.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {displayedSales.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.empty}>
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

import React from 'react';
import styles from './SalesHistoryTable.module.css';

interface Sale {
    id: number | string;
    operator: string;
    amount: number;
    product: string;
    time: string;
    quruvchi: string;
    status: string;
}

interface AdminSalesHistoryTableProps {
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

export default function AdminSalesHistoryTable({ sales }: AdminSalesHistoryTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const confirmedSales = sales.filter(s => s.status === 'tasdiqlandi');
    const confirmedCount = confirmedSales.length;
    const totalRevenue = confirmedSales.reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className={`card ${styles.container}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>Barcha Sotuvlar Jadvali</h3>
                <div className={styles.statsRow}>
                    <div className={styles.statBadge}>
                        <span className={styles.statLabel}>Tasdiqlangan:</span>
                        <span className={styles.statValue}>{confirmedCount} ta</span>
                    </div>
                    <div className={styles.statBadge}>
                        <span className={styles.statLabel}>Jami:</span>
                        <span className={styles.statValue}>{sales.length} ta</span>
                    </div>
                    <div className={styles.totalBadge}>
                        <span className={styles.statLabel}>Jami Daromad:</span>
                        <span className={styles.statValue}>{formatCurrency(totalRevenue)}</span>
                    </div>
                </div>
            </div>
            <div className={styles.tableReflow}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Sana</th>
                            <th>Operator</th>
                            <th>Obyekt</th>
                            <th>Quruvchi</th>
                            <th>Komissiya</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale, index) => (
                            <tr key={`${sale.id}-${index}`}>
                                <td className={styles.time}>{sale.time}</td>
                                <td style={{ fontWeight: 600 }}>{sale.operator || "Noma'lum"}</td>
                                <td className={styles.product}>{sale.product}</td>
                                <td className={styles.builder}>{sale.quruvchi || "Noma'lum"}</td>
                                <td className={styles.amount}>
                                    {sale.status === 'tasdiqlandi'
                                        ? formatCurrency(sale.amount)
                                        : <span className={styles.pending}>{formatCurrency(sale.amount)}</span>
                                    }
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[statusColors[sale.status] || 'statusNew']}`}>
                                        {statusLabels[sale.status] || sale.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.empty}>
                                    Bu oyda yetarli ma'lumot topilmadi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {sales.length > 0 && (
                <div className={styles.footer}>
                    <p className={styles.note}>
                        💡 Admin panelida barcha operatorlarning natijalari ko'rsatilmoqda. Komissiya narxlari har bir operatorning o'zidagi foizlarga bog'liq bo'lmasdan (API'dan qanday kelsa shunday) ko'rsatiladi.
                    </p>
                </div>
            )}
        </div>
    );
}

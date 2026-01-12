import React from 'react';
import styles from './RecentSales.module.css';

interface Sale {
    id: number | string;
    amount: number;
    product: string;
    time: string;
    quruvchi: string;
    status: string;
}

interface RecentSalesProps {
    sales: Sale[];
    activeFilter: string | null;
    hideBuilder?: boolean;
}

const statusLabels: Record<string, string> = {
    'tasdiqlandi': 'Tasdiqlandi',
    'yangi': 'Yangi',
    'jarayonda': 'Jarayonda',
    'tasdiqlanmadi': 'Tasdiqlanmadi',
    'bekor qilindi': 'Bekor qilindi'
};

export default function RecentSales({ sales, activeFilter, hideBuilder }: RecentSalesProps) {
    return (
        <div className={`card ${styles.container}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    {activeFilter ? `${statusLabels[activeFilter] || activeFilter} Sotuvlar` : 'Oxirgi Sotuvlar'}
                </h3>
                {activeFilter && <span className={styles.filterBadge}>{sales.length} ta</span>}
            </div>
            <div className={styles.tableReflow}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Obyekt</th>
                            {!hideBuilder && <th>Quruvchi</th>}
                            <th>Sana</th>
                            <th className={styles.right}>Summa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td className={styles.product}>
                                    <div className={styles.productName}>{sale.product}</div>
                                    <div className={styles.statusMobile}>{statusLabels[sale.status] || sale.status}</div>
                                </td>
                                {!hideBuilder && <td className={styles.builder}>{sale.quruvchi}</td>}
                                <td className={styles.time}>{sale.time}</td>
                                <td className={`${styles.amount} ${styles.right}`}>
                                    {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(sale.amount)}
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={hideBuilder ? 3 : 4} className={styles.empty}>Hali sotuv yo'q.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

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
    hideAmount?: boolean;
    showBuilderInstead?: boolean; // Show Quruvchi instead of Obyekt in first column
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

export default function RecentSales({ sales, activeFilter, hideBuilder, hideAmount, showBuilderInstead }: RecentSalesProps) {
    const getColSpan = () => {
        let span = 5; // base columns including status
        if (hideBuilder) span--;
        if (hideAmount) span--;
        return span;
    };

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
                            <th>{showBuilderInstead ? 'Quruvchi' : 'Obyekt'}</th>
                            {!hideBuilder && <th>Quruvchi</th>}
                            <th>Sana</th>
                            <th>Status</th>
                            {!hideAmount && <th className={styles.right}>Summa</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td className={styles.product}>
                                    <div className={styles.productName}>{showBuilderInstead ? sale.quruvchi : sale.product}</div>
                                    <div className={styles.statusMobile}>{statusLabels[sale.status] || sale.status}</div>
                                </td>
                                {!hideBuilder && <td className={styles.builder}>{sale.quruvchi}</td>}
                                <td className={styles.time}>{sale.time}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[statusColors[sale.status] || 'statusNew']}`}>
                                        {statusLabels[sale.status] || sale.status}
                                    </span>
                                </td>
                                {!hideAmount && (
                                    <td className={`${styles.amount} ${styles.right}`}>
                                        {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(sale.amount)}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={getColSpan()} className={styles.empty}>Hali sotuv yo'q.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


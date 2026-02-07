import React from 'react';
import styles from './RecentSales.module.css';
import { calculateCommission } from '@/utils/commission';

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
    showBuilderInstead?: boolean;
    showKPI?: boolean; // Show KPI column with dynamic rate
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

export default function RecentSales({ sales, activeFilter, hideBuilder, hideAmount, showBuilderInstead, showKPI }: RecentSalesProps) {
    // Calculate KPI rate based on confirmed sales
    const confirmedSales = sales.filter(s => s.status === 'tasdiqlandi');
    const confirmedCount = confirmedSales.length;
    const totalRevenue = confirmedSales.reduce((sum, s) => sum + s.amount, 0);
    const kpiData = calculateCommission(confirmedCount, totalRevenue);
    const currentRate = kpiData.commissionRate;
    const ratePercent = (currentRate * 100).toFixed(0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getColSpan = () => {
        let span = 4; // base columns
        if (!hideBuilder) span++;
        if (!hideAmount) span++;
        if (showKPI) span++;
        return span;
    };

    return (
        <div className={`card ${styles.container}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    {activeFilter ? `${statusLabels[activeFilter] || activeFilter} Sotuvlar` : 'Oxirgi Sotuvlar'}
                </h3>
                {showKPI && confirmedCount > 0 && (
                    <span className={styles.rateBadge}>Foiz: {ratePercent}%</span>
                )}
                {activeFilter && <span className={styles.filterBadge}>{sales.length} ta</span>}
            </div>
            <div className={styles.tableReflow}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{showBuilderInstead ? 'Quruvchi' : 'Obyekt'}</th>
                            {!hideBuilder && <th>Quruvchi</th>}
                            <th>Sana</th>
                            {showKPI && <th>KPI ({ratePercent}%)</th>}
                            <th>Status</th>
                            {!hideAmount && <th className={styles.right}>Summa</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => {
                            const saleKPI = sale.status === 'tasdiqlandi'
                                ? sale.amount * currentRate
                                : 0;

                            return (
                                <tr key={sale.id}>
                                    <td className={styles.product}>
                                        <div className={styles.productName}>{showBuilderInstead ? sale.quruvchi : sale.product}</div>
                                        <div className={styles.statusMobile}>{statusLabels[sale.status] || sale.status}</div>
                                    </td>
                                    {!hideBuilder && <td className={styles.builder}>{sale.quruvchi}</td>}
                                    <td className={styles.time}>{sale.time}</td>
                                    {showKPI && (
                                        <td className={styles.kpiAmount}>
                                            {sale.status === 'tasdiqlandi'
                                                ? formatCurrency(saleKPI)
                                                : <span className={styles.pending}>—</span>
                                            }
                                        </td>
                                    )}
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[statusColors[sale.status] || 'statusNew']}`}>
                                            {statusLabels[sale.status] || sale.status}
                                        </span>
                                    </td>
                                    {!hideAmount && (
                                        <td className={`${styles.amount} ${styles.right}`}>
                                            {formatCurrency(sale.amount)}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
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

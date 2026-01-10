import React from 'react';
import styles from './RecentSales.module.css';

interface Sale {
    id: number | string;
    amount: number;
    product: string;
    time: string;
}

interface RecentSalesProps {
    sales: Sale[];
}

export default function RecentSales({ sales }: RecentSalesProps) {
    return (
        <div className={`card ${styles.container}`}>
            <h3 className={styles.title}>Oxirgi Sotuvlar</h3>
            <div className={styles.tableReflow}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Obyekt</th>
                            <th>Sana</th>
                            <th className={styles.right}>Summa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td className={styles.product}>{sale.product}</td>
                                <td className={styles.time}>{sale.time}</td>
                                <td className={`${styles.amount} ${styles.right}`}>
                                    {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(sale.amount)}
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={3} className={styles.empty}>Hali sotuv yo'q.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

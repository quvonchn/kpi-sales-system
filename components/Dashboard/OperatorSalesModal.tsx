import React from 'react';
import styles from './OperatorSalesModal.module.css';

interface Sale {
    id: string | number;
    amount: number;
    product: string;
    time: string;
    quruvchi: string;
    status: string;
}

interface OperatorSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    operatorName: string | null;
    sales: Sale[];
    loading: boolean;
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

export default function OperatorSalesModal({ isOpen, onClose, operatorName, sales, loading }: OperatorSalesModalProps) {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const confirmedSales = sales.filter(s => s.status === 'tasdiqlandi');
    const totalRevenue = confirmedSales.reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>{operatorName}</h2>
                        <p className={styles.subtitle}>Joriy oy savdolar tafsiloti</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Yopish">
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Yuklanmoqda...</div>
                    ) : (
                        <>
                            <div className={styles.statsSummary}>
                                <div className={`${styles.statBox} ${styles.statBoxTotal}`}>
                                    <span className={styles.statLabel}>Tasdiqlangan Daromad</span>
                                    <span className={styles.statValue}>{formatCurrency(totalRevenue)}</span>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Sotuvlar soni</span>
                                    <span className={styles.statValue}>{confirmedSales.length} ta</span>
                                </div>
                            </div>

                            <div className={styles.tableReflow}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Sana</th>
                                            <th>Obyekt</th>
                                            <th>Daromad</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {confirmedSales.map((sale, index) => (
                                            <tr key={`${sale.id}-${index}`}>
                                                <td className={styles.time}>{sale.time}</td>
                                                <td className={styles.product}>
                                                    {sale.product}
                                                    <div className={styles.builder}>{sale.quruvchi || "Noma'lum"}</div>
                                                </td>
                                                <td className={styles.amount}>
                                                    {formatCurrency(sale.amount)}
                                                </td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                                                        {statusLabels[sale.status] || sale.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {confirmedSales.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className={styles.empty}>
                                                    Bu oyda tasdiqlangan savdo mavjud emas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

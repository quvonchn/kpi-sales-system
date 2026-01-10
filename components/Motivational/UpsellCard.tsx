import React from 'react';
import styles from './UpsellCard.module.css';

interface UpsellCardProps {
    currentSalesCount: number;
    currentTotalRevenue: number;
    currentCommission: number;
    potentialCommission: number;
    formatCurrency: (amount: number) => string;
}

export default function UpsellCard({
    currentSalesCount,
    currentTotalRevenue,
    currentCommission,
    potentialCommission,
    formatCurrency
}: UpsellCardProps) {
    const diff = potentialCommission - currentCommission;
    const hypotheticalTotal = currentTotalRevenue * 3;
    const displayDiff = potentialCommission - currentCommission > 0 ? potentialCommission - currentCommission : 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>💎</span>
                <div className={styles.titleGroup}>
                    <h3 className={styles.title}>Mahoratni oshiring!</h3>
                    <p className={styles.subtitle}>
                        Agar siz {currentSalesCount} ta qimmatroq uyni sotishingiz hisobiga {formatCurrency(hypotheticalTotal)} komissiya miqdori bo'lardi va sizning daromadingiz {formatCurrency(potentialCommission)} bo'lardi
                    </p>
                </div>
            </div>

            <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Hozirgi daromadingiz:</span>
                    <span className={styles.statValue}>{formatCurrency(currentCommission)}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Kattaroq natija bilan:</span>
                    <span className={styles.statValueHighlight}>{formatCurrency(potentialCommission)}</span>
                </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.footer}>
                <span className={styles.footerText}>
                    Tafovvut: <strong>{formatCurrency(displayDiff)}</strong> ko'proq foyda!
                </span>
                <p className={styles.motivation}>
                    Kattaroq maqsadlar sari olg'a! 💪
                </p>
            </div>
        </div>
    );
}

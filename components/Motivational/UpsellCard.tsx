import React from 'react';
import styles from './UpsellCard.module.css';

interface UpsellCardProps {
    currentCommission: number;
    potentialCommission: number;
    formatCurrency: (amount: number) => string;
}

export default function UpsellCard({ currentCommission, potentialCommission, formatCurrency }: UpsellCardProps) {
    const diff = potentialCommission - currentCommission;

    // If current is already higher (unlikely in this context), don't show negative
    const displayDiff = diff > 0 ? diff : 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>💎</span>
                <div className={styles.titleGroup}>
                    <h3 className={styles.title}>Mahoratni oshiring!</h3>
                    <p className={styles.subtitle}>
                        Agar siz ko'proq foyda keltiruvchi uylar sotganingizda edi...
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

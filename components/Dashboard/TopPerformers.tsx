import React, { useEffect, useState } from 'react';
import styles from './TopPerformers.module.css';

interface OperatorStat {
    name: string;
    salesCount: number;
    commissionAmount: number;
}

export default function TopPerformers() {
    const [top3, setTop3] = useState<OperatorStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTop() {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                if (data.operators) {
                    setTop3(data.operators.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching top performers:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTop();
    }, []);

    if (loading) return null;
    if (top3.length === 0) return null;

    return (
        <div className={`card ${styles.container}`}>
            <h3 className={styles.title}>
                <span className={styles.liveDot} />
                🏆 Oyning Eng Yaxshi Operatorlari
            </h3>
            <div className={styles.list}>
                {top3.map((op, index) => (
                    <div key={op.name} className={styles.item}>
                        <div className={styles.rank}>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                        </div>
                        <div className={styles.info}>
                            <span className={styles.name}>{op.name}</span>
                            <span className={styles.sales}>{op.salesCount} ta sotuv</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

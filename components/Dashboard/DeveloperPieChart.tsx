'use client';

import React from 'react';
import styles from './DeveloperPieChart.module.css';

interface Sale {
    quruvchi: string;
}

interface DeveloperPieChartProps {
    sales: Sale[];
}

export default function DeveloperPieChart({ sales }: DeveloperPieChartProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Only trigger if 100% visible
                if (entry.intersectionRatio >= 1.0) {
                    setIsVisible(true);
                }
            },
            {
                threshold: [0, 0.5, 1.0]
            }
        );

        if (chartRef.current) {
            observer.observe(chartRef.current);
        }

        return () => observer.disconnect();
    }, []);

    if (!sales || sales.length === 0) return null;

    // Process data
    const counts: Record<string, number> = {};
    sales.forEach(sale => {
        const name = sale.quruvchi || 'Noma\'lum';
        counts[name] = (counts[name] || 0) + 1;
    });

    const total = sales.length;
    const data = Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        percent: (count / total) * 100
    })).sort((a, b) => b.count - a.count);

    // Modern color palette
    const colors = [
        '#6366f1', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#06b6d4', // Cyan
        '#ec4899'  // Pink
    ];

    const topDeveloper = data.length > 0 ? data[0] : null;

    return (
        <div ref={chartRef} className={`card ${styles.container}`}>
            <h3 className={styles.title}>Quruvchilar ulushi</h3>
            <div className={styles.content}>
                <div className={styles.chartWrapper}>
                    <svg viewBox="0 0 36 36" className={`${styles.circularChart} ${isVisible ? styles.animate : ''}`}>
                        {data.map((item, index) => {
                            let offset = 0;
                            for (let i = 0; i < index; i++) {
                                offset += data[i].percent;
                            }
                            return (
                                <path
                                    key={item.name}
                                    className={styles.circle}
                                    strokeDasharray={`${isVisible ? item.percent : 0} 100`}
                                    strokeDashoffset={-offset}
                                    stroke={colors[index % colors.length]}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            );
                        })}
                    </svg>
                </div>
                <div className={styles.legend}>
                    {data.map((item, index) => (
                        <div key={item.name} className={styles.legendItem}>
                            <span className={styles.dot} style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className={styles.name}>{item.name}</span>
                            <span className={styles.percent}>{item.percent.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {topDeveloper && (
                <div className={styles.motivationBox}>
                    <p className={styles.motivationText}>
                        Siz eng ko'p <strong>"{topDeveloper.name}"</strong> quruvchiga tegishli uylarni sotyabsiz.
                        Agar siz boshqa quruvchiga tegishli qimmatroq uylarni ko'proq sotsangiz daromadingiz o'shishi aniq. 🚀
                    </p>
                </div>
            )}
        </div>
    );
}

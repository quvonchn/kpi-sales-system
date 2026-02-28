'use client';

import React from 'react';
import styles from './DeveloperPieChart.module.css'; // Reuse existing styles

interface Sale {
    quruvchi: string;
    status: string;
}

interface KPIPieChartProps {
    sales: Sale[];
}

export default function KPIPieChart({ sales }: KPIPieChartProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.intersectionRatio >= 0.2) {
                    setIsVisible(true);
                }
            },
            { threshold: [0.2, 0.5, 1.0] }
        );

        if (chartRef.current) {
            observer.observe(chartRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Filter only confirmed sales (case-insensitive)
    const confirmedSales = sales.filter(s => s.status?.toLowerCase().trim() === 'tasdiqlandi');

    if (confirmedSales.length === 0) {
        return (
            <div ref={chartRef} className={`card ${styles.container}`}>
                <h3 className={styles.title}>Quruvchilar ulushi</h3>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Tasdiqlangan sotuvlar mavjud emas
                </div>
            </div>
        );
    }

    // Process data - group by quruvchi and count sales
    const countsByBuilder: Record<string, number> = {};
    confirmedSales.forEach(sale => {
        const name = sale.quruvchi || "Noma'lum";
        countsByBuilder[name] = (countsByBuilder[name] || 0) + 1;
    });

    const total = confirmedSales.length;
    const data = Object.entries(countsByBuilder)
        .map(([name, count]) => ({
            name,
            count,
            percent: (count / total) * 100
        }))
        .sort((a, b) => b.count - a.count);

    // Color palette
    const colors = [
        '#7970F2', '#50C878', '#F5A623', '#EF4444',
        '#06B6D4', '#EC4899', '#8B5CF6',
    ];

    const circumference = 2 * Math.PI * 15.9155;
    let accumulatedOffset = 0;

    return (
        <div ref={chartRef} className={`card ${styles.container} ${isVisible ? styles.animate : ''}`}>
            <h3 className={styles.title}>Quruvchilar ulushi</h3>

            <div className={styles.chartContainer}>
                <svg
                    viewBox="0 0 36 36"
                    className={`${styles.donutChart} ${isVisible ? styles.animateChart : ''}`}
                >
                    <circle
                        className={styles.backgroundCircle}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                    />

                    {data.map((item, index) => {
                        const segmentLength = (item.percent / 100) * circumference;
                        const dashOffset = -accumulatedOffset;
                        accumulatedOffset += segmentLength;

                        return (
                            <circle
                                key={item.name}
                                className={styles.segment}
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="none"
                                stroke={colors[index % colors.length]}
                                strokeWidth="3.5"
                                strokeDasharray={`${isVisible ? segmentLength : 0} ${circumference}`}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            />
                        );
                    })}
                </svg>

                <div className={`${styles.centerText} ${isVisible ? styles.fadeIn : ''}`}>
                    <span className={styles.totalNumber}>{confirmedSales.length}</span>
                    <span className={styles.totalLabel}>Sotuvlar</span>
                </div>
            </div>

            <div className={styles.legend}>
                {data.map((item, index) => (
                    <div
                        key={item.name}
                        className={`${styles.legendItem} ${isVisible ? styles.fadeInUp : ''}`}
                        style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                    >
                        <span
                            className={styles.legendDot}
                            style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className={styles.legendName}>{item.name}</span>
                        <span className={styles.legendPercent}>
                            {item.percent.toFixed(0)}% ({item.count} ta)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

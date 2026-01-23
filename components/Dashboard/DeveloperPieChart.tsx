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
                if (entry.intersectionRatio >= 0.2) {
                    setIsVisible(true);
                }
            },
            {
                threshold: [0.2, 0.5, 1.0]
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

    // Color palette matching design
    const colors = [
        '#7970F2', // Purple/Indigo (primary)
        '#50C878', // Emerald Green
        '#F5A623', // Amber/Orange
        '#EF4444', // Red
        '#06B6D4', // Cyan
        '#EC4899', // Pink
        '#8B5CF6', // Violet
    ];

    // Calculate stroke properties for each segment
    const circumference = 2 * Math.PI * 15.9155; // ~100 for viewBox 36x36
    let accumulatedOffset = 0;

    return (
        <div ref={chartRef} className={`card ${styles.container} ${isVisible ? styles.animate : ''}`}>
            <h3 className={styles.title}>Quruvchilar ulushi</h3>

            {/* Chart Container - Centered */}
            <div className={styles.chartContainer}>
                <svg
                    viewBox="0 0 36 36"
                    className={`${styles.donutChart} ${isVisible ? styles.animateChart : ''}`}
                >
                    {/* Background circle (optional subtle ring) */}
                    <circle
                        className={styles.backgroundCircle}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                    />

                    {/* Data segments */}
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
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            />
                        );
                    })}
                </svg>

                {/* Center text showing total */}
                <div className={`${styles.centerText} ${isVisible ? styles.fadeIn : ''}`}>
                    <span className={styles.totalNumber}>{total}</span>
                    <span className={styles.totalLabel}>Sotuvlar</span>
                </div>
            </div>

            {/* Legend - Below Chart */}
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
                        <span className={styles.legendPercent}>{item.percent.toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

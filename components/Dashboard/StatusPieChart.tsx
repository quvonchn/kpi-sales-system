'use client';

import React from 'react';
import styles from './StatusPieChart.module.css';

interface Sale {
    status: string;
}

interface StatusPieChartProps {
    sales: Sale[];
    onFilterChange: (status: string | null) => void;
    activeFilter: string | null;
}

const statusConfig: Record<string, { label: string, color: string }> = {
    'tasdiqlandi': { label: 'Tasdiqlandi', color: '#00A389' },    // Brand Teal
    'jarayonda': { label: 'Jarayonda', color: '#f59e0b' },      // Amber
    'tasdiqlanmadi': { label: 'Tasdiqlanmadi', color: '#ef4444' }, // Red
    'yangi': { label: 'Yangi', color: '#6366f1' },              // Indigo
    'bekor qilindi': { label: 'Bekor qilindi', color: '#64748b' }, // Slate
};

export default function StatusPieChart({ sales, onFilterChange, activeFilter }: StatusPieChartProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
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
        const status = (sale.status || '').toLowerCase().trim() || 'noma\'lum';
        counts[status] = (counts[status] || 0) + 1;
    });

    const total = sales.length;
    const data = Object.entries(counts).map(([status, count]) => ({
        status,
        label: statusConfig[status]?.label || status,
        count,
        percent: (count / total) * 100,
        color: statusConfig[status]?.color || '#d5dde8'
    })).sort((a, b) => b.count - a.count);

    return (
        <div ref={chartRef} className={`card ${styles.container} ${isVisible ? styles.animate : ''}`}>
            <h3 className={styles.title}>Statuslar tahlili</h3>
            <div className={styles.content}>
                <div className={styles.chartWrapper}>
                    <svg viewBox="0 0 36 36" className={styles.circularChart}>
                        {data.map((item, index) => {
                            let offset = 0;
                            for (let i = 0; i < index; i++) {
                                offset += data[i].percent;
                            }
                            const isActive = activeFilter === item.status;
                            return (
                                <path
                                    key={item.status}
                                    className={`${styles.circle} ${isActive ? styles.circleActive : ''}`}
                                    strokeDasharray={`${isVisible ? item.percent : 0} 100`}
                                    strokeDashoffset={-offset}
                                    stroke={item.color}
                                    onClick={() => onFilterChange(isActive ? null : item.status)}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            );
                        })}
                    </svg>
                </div>
                <div className={styles.legend}>
                    {data.map((item) => {
                        const isActive = activeFilter === item.status;
                        return (
                            <div
                                key={item.status}
                                className={`${styles.legendItem} ${isActive ? styles.legendItemActive : ''}`}
                                onClick={() => onFilterChange(isActive ? null : item.status)}
                            >
                                <span className={styles.dot} style={{ backgroundColor: item.color }}></span>
                                <span className={styles.name}>{item.label}</span>
                                <span className={styles.count}>{item.count} ta</span>
                                <span className={styles.percent}>{item.percent.toFixed(0)}%</span>
                            </div>
                        );
                    })}
                    {activeFilter && (
                        <button className={styles.resetBtn} onClick={() => onFilterChange(null)}>
                            Filtrni tiklash
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

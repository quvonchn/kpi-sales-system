import React, { useState, useEffect } from 'react';
import styles from './AdminTrendChart.module.css';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface TrendData {
    month: string;
    fullYearMonth: string;
    total: number;
    [operatorName: string]: string | number;
}

export default function AdminTrendChart() {
    const [data, setData] = useState<TrendData[]>([]);
    const [operators, setOperators] = useState<string[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrends() {
            try {
                const response = await fetch('/api/admin/trends');
                const result = await response.json();

                if (result.trends) {
                    setData(result.trends);
                }
                if (result.operators) {
                    setOperators(result.operators);
                }
            } catch (error) {
                console.error("Failed to fetch admin trends", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTrends();
    }, []);

    if (loading) {
        return <div className={styles.loadingContainer}>Trendlar yuklanmoqda...</div>;
    }

    if (data.length === 0) {
        return (
            <div className={`card ${styles.container}`}>
                <div className={styles.emptyState}>Tasdiqlangan savdolar tarixi mavjud emas</div>
            </div>
        );
    }

    const chartLineKey = selectedOperator || 'total';
    const chartLineName = selectedOperator || 'Jami Barcha Operatorlar';

    // We can define a fixed color for the line (e.g. primary color)
    const lineColor = selectedOperator ? '#8B5CF6' : '#0d6efd';

    return (
        <div className={`card ${styles.container}`}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2 className={styles.title}>Oylik Savdo Dinamikasi</h2>
                    <p className={styles.subtitle}>{chartLineName}</p>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Side: Chart */}
                <div className={styles.chartArea}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}
                                itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                                formatter={(value: number | string | undefined) => [`${value} ta`, chartLineName]}
                                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey={chartLineKey}
                                name={chartLineName}
                                stroke={lineColor}
                                strokeWidth={3}
                                activeDot={{ r: 6, fill: lineColor, stroke: 'var(--background)', strokeWidth: 2 }}
                                dot={{ r: 4, fill: 'var(--background)', stroke: lineColor, strokeWidth: 2 }}
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Right Side: Operator List */}
                <div className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>Operatorni tanlang:</h3>
                    <div className={styles.operatorList}>
                        <button
                            className={`${styles.operatorBtn} ${selectedOperator === null ? styles.operatorBtnActive : ''}`}
                            onClick={() => setSelectedOperator(null)}
                        >
                            Jami barchasi
                        </button>

                        {operators.map(op => (
                            <button
                                key={op}
                                className={`${styles.operatorBtn} ${selectedOperator === op ? styles.operatorBtnActive : ''}`}
                                onClick={() => setSelectedOperator(op)}
                            >
                                {op}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

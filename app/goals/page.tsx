'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/Auth/AuthGuard';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import styles from './page.module.css';

interface GoalEntry {
    rowIndex: number;
    goalId: string;
    goalName: string;
    priceUzs: number;
    imageUrl: string;
    setAt: string;
    status: 'active' | 'achieved' | 'failed';
    resolvedAt?: string;
}

const STATUS_LABELS = {
    active:   { label: "Faol",         emoji: "🎯", cls: "active"   },
    achieved: { label: "Erishdim! ✅", emoji: "🏆", cls: "achieved" },
    failed:   { label: "Erisha olmadim ❌", emoji: "😔", cls: "failed" },
};

export default function GoalsPage() {
    const [history, setHistory] = useState<GoalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        setLoading(true);
        try {
            const res = await fetch('/api/goals/history');
            const data = await res.json();
            if (data.history) setHistory(data.history);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatus(rowIndex: number, status: 'achieved' | 'failed') {
        setUpdating(rowIndex);
        try {
            await fetch('/api/goals/history', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rowIndex, status }),
            });
            // Optimistic update
            setHistory(prev =>
                prev.map(g => g.rowIndex === rowIndex ? { ...g, status, resolvedAt: new Date().toISOString() } : g)
            );
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(null);
        }
    }

    function formatDate(iso: string) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount) + ' UZS';
    }

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>🎯 Maqsadlarim Tarixi</h1>
                            <p className={styles.pageSubtitle}>
                                Har bir oyda qo'ygan maqsadlaringiz va ularning natijasi
                            </p>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                                <p>Yuklanmoqda...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>🎯</span>
                                <h3>Hali maqsad qo'yilmagan</h3>
                                <p>Dashboard'ga o'tib birinchi maqsadingizni qo'ying!</p>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {history.map((entry) => {
                                    const s = STATUS_LABELS[entry.status];
                                    const isActive = entry.status === 'active';
                                    const isUpdating = updating === entry.rowIndex;
                                    return (
                                        <div key={entry.rowIndex} className={`${styles.card} ${styles[s.cls]}`}>
                                            {/* Decorative orb */}
                                            <div className={styles.orb} />

                                            {/* Status badge */}
                                            <span className={`${styles.badge} ${styles['badge_' + s.cls]}`}>
                                                {s.emoji} {s.label}
                                            </span>

                                            {/* Product info */}
                                            <div className={styles.product}>
                                                <div className={styles.imageBox}>
                                                    <img
                                                        src={entry.imageUrl || 'https://cdn-icons-png.flaticon.com/512/3768/3768393.png'}
                                                        alt={entry.goalName}
                                                        onError={e => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3768/3768393.png'; }}
                                                    />
                                                </div>
                                                <div className={styles.productInfo}>
                                                    <h3 className={styles.productName}>{entry.goalName}</h3>
                                                    <p className={styles.productPrice}>{formatCurrency(entry.priceUzs)}</p>
                                                </div>
                                            </div>

                                            {/* Dates */}
                                            <div className={styles.dates}>
                                                <div className={styles.dateItem}>
                                                    <span className={styles.dateLabel}>Qo'yilgan sana</span>
                                                    <span className={styles.dateValue}>{formatDate(entry.setAt)}</span>
                                                </div>
                                                {entry.resolvedAt && (
                                                    <div className={styles.dateItem}>
                                                        <span className={styles.dateLabel}>Hal qilingan</span>
                                                        <span className={styles.dateValue}>{formatDate(entry.resolvedAt)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action buttons — only for active goals */}
                                            {isActive && (
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.achievedBtn}
                                                        onClick={() => handleStatus(entry.rowIndex, 'achieved')}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? '...' : '🏆 Erishdim!'}
                                                    </button>
                                                    <button
                                                        className={styles.failedBtn}
                                                        onClick={() => handleStatus(entry.rowIndex, 'failed')}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? '...' : '😔 Erisha olmadim'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

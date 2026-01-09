'use client';

import React from 'react';
import styles from '../page.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';

export default function KPIDetailsPage() {
    const tiers = [
        { range: '1-3 ta sotuv', rate: '5%' },
        { range: '4-6 ta sotuv', rate: '7%' },
        { range: '7-10 ta sotuv', rate: '10%' },
        { range: '11-15 ta sotuv', rate: '14%' },
        { range: '16-20 ta sotuv', rate: '16%' },
        { range: '21+ ta sotuv', rate: '20%' },
    ];

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />
                    <div className="card" style={{ marginTop: '2rem' }}>
                        <h2>KPI Hisoblash Qoidalari</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sotuvlar soniga qarab komissiya miqdori o'zgaradi</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {tiers.map((tier, i) => (
                                <div key={i} style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{tier.range}</h3>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{tier.rate} Komissiya</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.05)', border: '1px border-blue-200' }}>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>💡 Ma'lumot:</h4>
                            <p>Komissiya jami sotilgan mahsulotlar summasidan (revenue) belgilangan foizda hisoblanadi. Har oy boshida sotuvlar soni nolga qaytariladi.</p>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

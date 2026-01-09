'use client';

import React from 'react';
import styles from '../page.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import { useAuth } from '@/lib/auth/useAuth';

export default function ProfilePage() {
    const { operator } = useAuth();

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />
                    <div className="card" style={{ marginTop: '2rem', maxWidth: '600px' }}>
                        <h2>Profil Ma'lumotlari</h2>
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', color: 'var(--text-secondary)' }}>Operator Nomi</label>
                                <p style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>{operator}</p>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', color: 'var(--text-secondary)' }}>Status</label>
                                <p style={{ color: 'var(--success)', fontWeight: 600 }}>Faol</p>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}
                            onClick={() => alert('Parolni o\'zgartirish funksiyasi tez kunda qo\'shiladi!')}
                        >
                            Parolni O'zgartirish
                        </button>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

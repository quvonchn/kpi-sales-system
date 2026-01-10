'use client';

import React from 'react';
import styles from '../page.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import AuthGuard from '@/components/Auth/AuthGuard';
import { useAuth } from '@/lib/auth/useAuth';

export default function ProfilePage() {
    const { operator } = useAuth();

    // Change password state
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showForm, setShowForm] = React.useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Yangi parollar bir-biriga mos kelmadi' });
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ type: 'error', text: 'Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: operator,
                    currentPassword,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Parol muvaffaqiyatli o\'zgartirildi!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setShowForm(false), 2000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Xatolik yuz berdi' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server bilan bog\'lanishda xatolik' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard>
            <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                    <Header />

                    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <div className="card" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'var(--primary)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    fontWeight: 800
                                }}>
                                    {operator?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Profil Ma'lumotlari</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Shaxsiy ma'lumotlaringiz va xavfsizlik sozlamalari</p>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '2rem',
                                padding: '1.5rem',
                                background: 'var(--background)',
                                borderRadius: '12px',
                                marginBottom: '2rem'
                            }}>
                                <div>
                                    <label style={{ fontWeight: 700, display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Operator Nomi</label>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{operator}</p>
                                </div>
                                <div>
                                    <label style={{ fontWeight: 700, display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tizimdagi Status</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%' }}></span>
                                        <p style={{ color: 'var(--success)', fontWeight: 700 }}>Faol</p>
                                    </div>
                                </div>
                            </div>

                            {!showForm ? (
                                <button
                                    className="btn-primary"
                                    style={{
                                        padding: '1rem 2rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(0, 163, 137, 0.2)'
                                    }}
                                    onClick={() => setShowForm(true)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Parolni O'zgartirish
                                </button>
                            ) : (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '2rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    animation: 'fadeIn 0.3s ease-out'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Yangi Parol O'rnatish</h3>
                                        <button
                                            onClick={() => setShowForm(false)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Bekor qilish
                                        </button>
                                    </div>

                                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Joriy Parol</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Hozirgi parolingizni kiriting"
                                                required
                                                style={{ padding: '0.875rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Yangi Parol</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Yangi parol ixtiro qiling"
                                                required
                                                style={{ padding: '0.875rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Yangi Parolni Takrorlang</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Parolni qayta tering"
                                                required
                                                style={{ padding: '0.875rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                                            />
                                        </div>

                                        {message && (
                                            <div style={{
                                                padding: '1rem',
                                                borderRadius: '10px',
                                                background: message.type === 'success' ? 'rgba(0, 163, 137, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                                                color: message.type === 'success' ? 'var(--success)' : '#dc2626',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                textAlign: 'center'
                                            }}>
                                                {message.text}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                marginTop: '0.5rem',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                transition: 'all 0.2s',
                                                opacity: loading ? 0.7 : 1
                                            }}
                                        >
                                            {loading ? 'Saqlanmoqda...' : 'Parolni Yangilash'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

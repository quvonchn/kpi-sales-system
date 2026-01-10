'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save to localStorage
                localStorage.setItem('operator', username);

                // Trigger opening animation
                setIsOpening(true);

                // Wait for animation to finish before navigating
                setTimeout(() => {
                    router.push('/');
                }, 800);
            } else {
                setError(data.error || 'Login xato');
            }
        } catch (err) {
            setError('Serverda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.house} ${isOpening ? styles.opening : ''}`}>
                <div className={styles.roof}></div>

                <div className={styles.body}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1>UYSOT <span style={{ color: 'var(--primary)', fontWeight: 800 }}>KPI</span></h1>
                    </div>

                    <h2 className={styles.title}>Tizimga Kirish</h2>
                    <p className={styles.subtitle}>Operator paneliga xush kelibsiz</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Operator Nomi</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ismingizni kiriting"
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Parol</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Parolingizni kiriting"
                                required
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button type="submit" className={styles.submitBtn} disabled={loading || isOpening}>
                            {loading ? 'Tekshirilmoqda...' : 'Kirish'}
                        </button>
                    </form>
                </div>

                <div className={styles.base}></div>
            </div>
        </div>
    );
}

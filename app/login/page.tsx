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
                <div className={styles.sun}></div>

                <div className={styles.body}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <svg width="34" height="34" viewBox="0 10 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.89648 30.9747C3.89648 29.3041 5.32203 27.9496 7.08055 27.9496H30.4304C32.189 27.9496 33.6145 29.3041 33.6145 30.9747C33.6145 32.6456 32.189 34.0001 30.4304 34.0001H7.08055C5.32203 34.0001 3.89648 32.6456 3.89648 30.9747Z" fill="white" />
                                <path d="M16.7608 0.895816C17.9976 -0.298605 20.0025 -0.298605 21.2391 0.895816L37.0726 16.1883C38.3091 17.3828 38.3091 19.3193 37.0726 20.5137C35.8359 21.7082 33.8309 21.7082 32.5942 20.5137L19 7.38388L5.40584 20.5137C4.16918 21.7082 2.16416 21.7082 0.927497 20.5137C-0.309166 19.3193 -0.309166 17.3828 0.927497 16.1883L16.7608 0.895816Z" fill="white" />
                                <circle cx="18.9" cy="19.9" r="4.9" fill="var(--accent)" />
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

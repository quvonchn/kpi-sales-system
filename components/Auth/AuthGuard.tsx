'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { ReactNode } from 'react';

export default function AuthGuard({ children }: { children: ReactNode }) {
    const { operator, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontSize: '1.2rem',
                color: 'var(--text-secondary)'
            }}>
                Yuklanmoqda...
            </div>
        );
    }

    if (!operator) {
        return null; // useAuth will redirect to login
    }

    return <>{children}</>;
}

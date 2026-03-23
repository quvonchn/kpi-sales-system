'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [operator, setOperator] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchMe() {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setOperator(data.operator);
                    setRole(data.role);
                } else {
                    // If not authenticated, the middleware should have redirected us,
                    // but we can also handle it here.
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to fetch auth session', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }
        fetchMe();
    }, [router]);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setOperator(null);
            setRole(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return { operator, role, loading, logout };
}


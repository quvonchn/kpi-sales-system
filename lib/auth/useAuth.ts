'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [operator, setOperator] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedOperator = localStorage.getItem('operator');

        if (!storedOperator) {
            router.push('/login');
        } else {
            setOperator(storedOperator);
        }

        setLoading(false);
    }, [router]);

    const logout = () => {
        localStorage.removeItem('operator');
        router.push('/login');
    };

    return { operator, loading, logout };
}

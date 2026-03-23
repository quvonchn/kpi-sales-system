import { NextRequest, NextResponse } from 'next/server';
import { validateOperator } from '@/lib/auth/operators';
import { login as setAuthCookie } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Login va parol kiritilishi shart' },
                { status: 400 }
            );
        }

        const operator = await validateOperator(username, password);

        if (operator) {
            // Set httpOnly cookie with JWT
            await setAuthCookie({ 
                name: operator.name, 
                role: operator.role || 'operator' 
            });

            return NextResponse.json({ 
                success: true, 
                operator: operator.name,
                role: operator.role || 'operator'
            });
        } else {
            return NextResponse.json(
                { error: 'Login yoki parol noto\'g\'ri' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Server xatosi' },
            { status: 500 }
        );
    }
}


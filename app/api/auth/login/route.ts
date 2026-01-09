import { NextRequest, NextResponse } from 'next/server';
import { validateOperator } from '@/lib/auth/operators';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Login va parol kiritilishi shart' },
                { status: 400 }
            );
        }

        const isValid = await validateOperator(username, password);

        if (isValid) {
            return NextResponse.json({ success: true, operator: username });
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

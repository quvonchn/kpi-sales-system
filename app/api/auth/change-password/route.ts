import { NextRequest, NextResponse } from 'next/server';
import { validateOperator, updateOperatorPassword } from '@/lib/auth/operators';

export async function POST(request: NextRequest) {
    try {
        const { username, currentPassword, newPassword } = await request.json();

        if (!username || !currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Barcha maydonlarni to\'ldirish shart' },
                { status: 400 }
            );
        }

        // 1. Verify current password
        const isValid = await validateOperator(username, currentPassword);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Joriy parol noto\'g\'ri' },
                { status: 401 }
            );
        }

        // 2. Update to new password
        const success = await updateOperatorPassword(username, newPassword);

        if (success) {
            return NextResponse.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
        } else {
            return NextResponse.json(
                { error: 'Parolni yangilashda xatolik yuz berdi' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Server xatosi' },
            { status: 500 }
        );
    }
}

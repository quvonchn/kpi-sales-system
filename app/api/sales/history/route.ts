import { NextRequest, NextResponse } from 'next/server';
import { getSalesByMonth } from '@/lib/sheets/sheets';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const operator = searchParams.get('operator');
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');

        if (!operator) {
            return NextResponse.json({ error: 'Operator not specified' }, { status: 400 });
        }

        const month = monthParam ? parseInt(monthParam) : undefined;
        const year = yearParam ? parseInt(yearParam) : undefined;

        const sales = await getSalesByMonth(operator, month, year);

        return NextResponse.json({ sales });
    } catch (error) {
        console.error('Sales History API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

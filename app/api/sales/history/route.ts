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

        // If "all" is passed (for admins), treat it as undefined to get everyone's sales
        const targetOperator = operator.toLowerCase() === 'all' ? undefined : operator;

        const month = monthParam ? parseInt(monthParam) : undefined;
        const year = yearParam ? parseInt(yearParam) : undefined;

        const sales = await getSalesByMonth(targetOperator, month, year);

        // Sort by date descending (newest first)
        sales.sort((a, b) => b.time.localeCompare(a.time));

        return NextResponse.json({ sales });
    } catch (error) {
        console.error('Sales History API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

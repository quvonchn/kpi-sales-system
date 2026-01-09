import { NextRequest, NextResponse } from 'next/server';
import { getTodaySalesFromSheets } from '@/lib/sheets/sheets';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const operator = searchParams.get('operator');

        if (!operator) {
            return NextResponse.json({ error: 'Operator not specified' }, { status: 400 });
        }

        const sales = await getTodaySalesFromSheets(operator);

        return NextResponse.json({ sales });
    } catch (error) {
        console.error('Sales API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

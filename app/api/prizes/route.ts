import { NextResponse } from 'next/server';
import { getCatalogPrizesFromSheets } from '@/lib/sheets/sheets';

export async function GET() {
    try {
        const prizes = await getCatalogPrizesFromSheets();
        return NextResponse.json({ prizes });
    } catch (error) {
        console.error('Error fetching prizes:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

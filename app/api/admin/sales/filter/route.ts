import { NextResponse } from 'next/server';
import { getSalesByDateRange } from '@/lib/sheets/sheets';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        const operatorsParam = searchParams.get('operators') || ''; // comma-separated
        const builderParam = searchParams.get('builder') || '';

        // 1. Fetch raw sales filtered by date range only
        let sales = await getSalesByDateRange(startDate, endDate);

        // 2. Extract unique operators and builders BEFORE applying their specific filters
        // This is necessary so the dropdowns in the frontend can show all available options
        // for the selected date range.
        const uniqueOperators = Array.from(new Set(sales.map(s => s.operator).filter(Boolean)));
        const uniqueBuilders = Array.from(new Set(sales.map(s => s.quruvchi).filter(Boolean)));

        // 3. Apply Multi-select Operator Filter
        if (operatorsParam) {
            const selectedOperators = operatorsParam.split(',').map(op => op.toLowerCase().trim());
            sales = sales.filter(s => selectedOperators.includes(s.operator.toLowerCase().trim()));
        }

        // 4. Apply Single-select Builder Filter
        if (builderParam) {
            const selectedBuilder = builderParam.toLowerCase().trim();
            sales = sales.filter(s => s.quruvchi.toLowerCase().trim() === selectedBuilder);
        }

        // 5. Sort sales by date descending (newest first)
        sales.sort((a, b) => b.time.localeCompare(a.time));

        return NextResponse.json({
            sales,
            metadata: {
                uniqueOperators,
                uniqueBuilders
            }
        });
    } catch (error) {
        console.error('Error fetching filtered sales history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch filtered sales history' },
            { status: 500 }
        );
    }
}

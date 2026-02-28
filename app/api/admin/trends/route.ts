import { NextResponse } from 'next/server';
import { getSalesByDateRange } from '@/lib/sheets/sheets';

export async function GET() {
    try {
        // Fetch all sales (no date limit here, we want all history)
        const allSales = await getSalesByDateRange();

        // 1. Filter only 'tasdiqlandi'
        const confirmedSales = allSales.filter(s => s.status === 'tasdiqlandi');

        // 2. Group by Month and then by Operator
        // We'll structure it like:
        // { '2026-Yanvar': { total: 10, 'Dilnavoz': 5, 'Nodira': 5 }, ... }
        const monthlyData: Record<string, { monthDate: Date, total: number, operators: Record<string, number> }> = {};

        confirmedSales.forEach(sale => {
            if (!sale.salesDate) return;

            // Use string splitting to get year and month, same as lib/sheets/sheets.ts
            // To avoid timezone shifts with new Date()
            const dateStr = sale.salesDate.split(' ')[0]; // Handle 'YYYY-MM-DD HH:mm:ss'
            const dateParts = dateStr.split('-');

            if (dateParts.length < 2) return;

            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Convert to 0-11 for consistency with my logic

            if (isNaN(year) || isNaN(month)) return;

            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    monthDate: new Date(year, month, 1),
                    total: 0,
                    operators: {}
                };
            }

            const opName = sale.operator || "Noma'lum";
            monthlyData[monthKey].total += 1;
            monthlyData[monthKey].operators[opName] = (monthlyData[monthKey].operators[opName] || 0) + 1;
        });

        // 3. Convert object to chronological array
        const sortedMonths = Object.keys(monthlyData).sort();

        const MONTH_NAMES = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
        ];

        const chartData = sortedMonths.map(key => {
            const data = monthlyData[key];
            const monthName = MONTH_NAMES[data.monthDate.getMonth()];

            // Format to return cleanly: { month: "Yanvar", total: 10, "Dilnavoz": 5, ... }
            return {
                month: monthName,
                fullYearMonth: `${monthName} ${data.monthDate.getFullYear()}`,
                total: data.total,
                ...data.operators
            };
        });

        // 4. Extract all unique operators that have at least one approved sale in history
        const uniqueOperators = Array.from(new Set(
            confirmedSales.map(s => s.operator).filter(Boolean)
        )).sort();

        return NextResponse.json({
            trends: chartData,
            operators: uniqueOperators
        });

    } catch (error) {
        console.error('Error fetching admin trends:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin trends' },
            { status: 500 }
        );
    }
}

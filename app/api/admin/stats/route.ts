import { NextRequest, NextResponse } from 'next/server';
import { getTodaySalesFromSheets } from '@/lib/sheets/sheets';
import { getOperators } from '@/lib/auth/operators';
import { calculateCommission } from '@/utils/commission';

export async function GET(request: NextRequest) {
    try {
        const operators = await getOperators();

        const operatorStats = await Promise.all(
            operators.map(async (op) => {
                const sales = await getTodaySalesFromSheets(op.name);
                const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
                const commission = calculateCommission(sales.length, totalRevenue);

                return {
                    name: op.name,
                    email: op.email,
                    salesCount: sales.length,
                    totalRevenue,
                    commissionRate: commission.commissionRate,
                    commissionAmount: commission.commissionAmount,
                };
            })
        );

        // Sort by sales count descending
        operatorStats.sort((a, b) => b.salesCount - a.salesCount);

        // Calculate totals
        const totals = {
            totalOperators: operators.length,
            totalSales: operatorStats.reduce((sum, op) => sum + op.salesCount, 0),
            totalRevenue: operatorStats.reduce((sum, op) => sum + op.totalRevenue, 0),
            totalCommission: operatorStats.reduce((sum, op) => sum + op.commissionAmount, 0),
        };

        return NextResponse.json({ operators: operatorStats, totals });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

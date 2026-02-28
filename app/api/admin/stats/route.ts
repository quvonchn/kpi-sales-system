import { NextRequest, NextResponse } from 'next/server';
import { getTodaySalesFromSheets } from '@/lib/sheets/sheets';
import { getOperators } from '@/lib/auth/operators';
import { calculateCommission } from '@/utils/commission';

export async function GET(request: NextRequest) {
    try {
        const operators = await getOperators();

        // Fetch ALL sales for the current month instead of per-operator
        // This ensures totals include sales from unknown operators too
        const allSheetSales = await getTodaySalesFromSheets(); // Empty arg = all operators

        // Only count 'tasdiqlandi'
        const confirmedSales = allSheetSales.filter(sale => sale.status === 'tasdiqlandi');

        const operatorStats = operators.map(op => {
            const opSales = confirmedSales.filter(s =>
                s.operator.toLowerCase().trim() === op.name.toLowerCase().trim()
            );

            const totalRevenue = opSales.reduce((sum, s) => sum + s.amount, 0);
            const commission = calculateCommission(opSales.length, totalRevenue);

            return {
                name: op.name,
                email: op.email,
                salesCount: opSales.length,
                totalRevenue,
                commissionRate: commission.commissionRate,
                commissionAmount: commission.commissionAmount,
            };
        });

        // Sort by sales count descending for ranking
        operatorStats.sort((a, b) => b.salesCount - a.salesCount);

        // Calculate totals from the ALL confirmed sales, not just the sum of known operators
        const totals = {
            totalOperators: operators.length,
            totalSales: confirmedSales.length,
            totalRevenue: confirmedSales.reduce((sum, s) => sum + s.amount, 0),
            totalCommission: confirmedSales.reduce((sum, s) => {
                // For totals, we should ideally re-calculate commission based on the TOTAL context
                // but usually, it's just a sum of individual commissions.
                // However, sum of op.commissionAmount only works if we know all operators.
                // Let's recalculate based on the sum of amounts if we want to be safe.
                const opSalesGroup = confirmedSales.filter(cs => cs.operator === s.operator);
                return sum; // Fallback to a better way below
            }, 0),
        };

        // Correct total commission calculation:
        // We need to sum up commissions for EACH operator (even unknown ones)
        // using the same logic.
        const operatorGroups: Record<string, { count: number, rev: number }> = {};
        confirmedSales.forEach(s => {
            const op = s.operator || "Unknown";
            if (!operatorGroups[op]) operatorGroups[op] = { count: 0, rev: 0 };
            operatorGroups[op].count++;
            operatorGroups[op].rev += s.amount;
        });

        let totalCommissionCalc = 0;
        Object.values(operatorGroups).forEach(group => {
            const comm = calculateCommission(group.count, group.rev);
            totalCommissionCalc += comm.commissionAmount;
        });

        totals.totalCommission = totalCommissionCalc;

        return NextResponse.json({ operators: operatorStats, totals });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

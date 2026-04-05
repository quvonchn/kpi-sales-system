import { NextRequest, NextResponse } from 'next/server';
import { getOperators } from '@/lib/auth/operators';
import { appendGoalHistory, getGoalHistory } from '@/lib/sheets/goals';
import { getSession } from '@/lib/auth/auth';

// GET — faol maqsadni goals varag'idan o'qish
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const operators = await getOperators();
        const operator = operators.find(op => op.name.toLowerCase() === session.name.toLowerCase());
        const operatorId = operator?.id || session.name;

        // goals varag'idan eng oxirgi 'active' maqsadni topamiz
        const history = await getGoalHistory(operatorId);
        const activeGoal = history.find(g => g.status === 'active') || null;

        if (activeGoal) {
            return NextResponse.json({
                goal: {
                    id: activeGoal.goalId,
                    name: activeGoal.goalName,
                    priceUzs: activeGoal.priceUzs,
                    imageUrl: activeGoal.imageUrl,
                    rowIndex: activeGoal.rowIndex, // for status updates
                }
            });
        }

        return NextResponse.json({ goal: null });
    } catch (error) {
        console.error('Error fetching goal:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — yangi maqsad qo'yish (goals varag'iga yoziladi)
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.goalData) {
            return NextResponse.json({ error: 'Missing goal data' }, { status: 400 });
        }

        const goal = body.goalData;

        const operators = await getOperators();
        const operator = operators.find(op => op.name.toLowerCase() === session.name.toLowerCase());
        const operatorId = operator?.id || session.name;

        // goals varag'iga yangi qator yozamiz
        await appendGoalHistory(operatorId, session.name, {
            id: String(goal.id || 'custom_' + Date.now()),
            name: goal.name,
            priceUzs: goal.priceUzs,
            imageUrl: goal.imageUrl || '',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving goal:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

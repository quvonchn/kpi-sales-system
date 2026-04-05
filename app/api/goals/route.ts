import { NextRequest, NextResponse } from 'next/server';
import { updateOperatorGoal, getOperators } from '@/lib/auth/operators';
import { getSession } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const operators = await getOperators();
        const operator = operators.find(op => op.name.toLowerCase() === session.name.toLowerCase());

        if (operator && operator.selectedGoal) {
            try {
                const goal = JSON.parse(operator.selectedGoal);
                return NextResponse.json({ goal });
            } catch (e) {
                console.error("Failed to parse selected goal:", e);
                return NextResponse.json({ goal: null });
            }
        }

        return NextResponse.json({ goal: null });
    } catch (error) {
        console.error('Error fetching goal:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

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

        const success = await updateOperatorGoal(session.name, JSON.stringify(body.goalData));

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error saving goal:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

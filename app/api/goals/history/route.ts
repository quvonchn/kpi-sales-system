import { NextRequest, NextResponse } from 'next/server';
import { getGoalHistory, updateGoalStatus } from '@/lib/sheets/goals';
import { getOperators } from '@/lib/auth/operators';
import { getSession } from '@/lib/auth/auth';

// GET — operator tarixi
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const operators = await getOperators();
        const operator = operators.find(op => op.name.toLowerCase() === session.name.toLowerCase());
        const operatorId = operator?.id || session.name;

        const history = await getGoalHistory(operatorId);

        // Sort newest first
        history.sort((a, b) => new Date(b.setAt).getTime() - new Date(a.setAt).getTime());

        return NextResponse.json({ history });
    } catch (error) {
        console.error('Error fetching goal history:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PATCH — maqsad statusini yangilash
export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.rowIndex || !body.status) {
            return NextResponse.json({ error: 'Missing rowIndex or status' }, { status: 400 });
        }

        if (!['achieved', 'failed'].includes(body.status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const success = await updateGoalStatus(body.rowIndex, body.status);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error updating goal status:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

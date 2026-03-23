import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({ 
        operator: session.name, 
        role: session.role || 'operator' 
    });
}

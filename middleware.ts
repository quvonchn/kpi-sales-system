import { NextRequest, NextResponse } from 'next/server';
import { decrypt, TOKEN_NAME } from './lib/auth/auth';

// 1. Specify protected and public routes
const protectedRoutes = ['/', '/admin', '/history', '/ranking', '/profile', '/kpi'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/login'];

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    // 3. Decrypt the session from the cookie
    const cookie = req.cookies.get(TOKEN_NAME)?.value;
    let session = null;
    
    if (cookie) {
        try {
            session = await decrypt(cookie);
        } catch (error) {
            console.error('Middleware: Session decryption failed', error);
        }
    }

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // 5. Redirect to / if the user is authenticated but tries to access /login
    if (isPublicRoute && session) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // 6. Redirect to / if the user is not an admin but tries to access an admin route
    if (isAdminRoute && session?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // 7. Protect API routes (except /api/auth/*)
    if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Admin API protection
        if (path.startsWith('/api/admin/') && session.role !== 'admin') {
            // Exception: allow /api/admin/stats to be accessed by operators for ranking
            if (!path.startsWith('/api/admin/stats')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|.*\\.png$).*)'],
};

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function getJwtKey(): Uint8Array {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        // Return a dummy key during build/dev if not provided, 
        // but it will fail at runtime if actually used without the secret.
        return new TextEncoder().encode('default-secret-do-not-use-in-production');
    }

    return new TextEncoder().encode(jwtSecret);
}

const key = getJwtKey();

export const TOKEN_NAME = 'auth_token';

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function login(payload: any) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt(payload);

    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, '', { expires: new Date(0) });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(TOKEN_NAME)?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get(TOKEN_NAME)?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: TOKEN_NAME,
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}

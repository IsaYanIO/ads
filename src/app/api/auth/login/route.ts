import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { comparePasswords } from '@/lib/auth';
import { signJwt } from '@/lib/jwt';
import { serialize } from 'cookie';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
        return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const token = await signJwt({ sub: user.id.toString(), email: user.email, role: user.role, });

        const response = NextResponse.json({
            message: 'Logged in',
            user: { id: user.id, email: user.email, role: user.role, },
        });

        response.headers.set(
        'Set-Cookie',
        serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60,
            sameSite: 'lax',
        })
        );

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}

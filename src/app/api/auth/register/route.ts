import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';
import { signJwt } from '@/lib/jwt';
import { serialize } from 'cookie';
import { verifyJwt } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {

    const token = req.cookies.get('token')?.value;
    const payload = token ? await verifyJwt(token) : null;

    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
        });

        const token = await signJwt({ sub: user.id.toString(), email: user.email });

        const response = NextResponse.json({
            message: 'User created',
            user: { id: user.id, email: user.email },
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
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}

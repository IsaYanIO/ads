import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const payload = token ? await verifyJwt(token) : null;

    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = Number(payload.sub);

        const responses = await prisma.response.findMany({
            where: { userId },
            include: {
                ad: true,
                user: { select: { id: true, email: true } },
            },
            orderBy: {
                id: 'desc',
            },
        });

        return NextResponse.json(responses);
    } catch (error) {
        console.error('Failed to fetch responses:', error);
        return NextResponse.json({ message: 'Failed to fetch responses' }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const payload = token ? await verifyJwt(token) : null;

    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { adId, message } = body;

        if (!adId || !message || typeof message !== 'string') {
            return NextResponse.json({ message: 'adId and message are required' }, { status: 400 });
        }

        const ad = await prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
            return NextResponse.json({ message: 'Ad not found' }, { status: 404 });
        }

        const response = await prisma.response.create({
        data: {
            adId,
            userId: Number(payload.sub),
            message,
        },
        });

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Failed to create response:', error);
        return NextResponse.json({ message: 'Failed to create response' }, { status: 500 });
    }
}

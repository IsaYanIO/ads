import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '@/lib/jwt';

const prisma = new PrismaClient();

interface Props {
    id: string;
}

async function getAuthPayload(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    return token ? await verifyJwt(token) : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<Props> }) {
    const payload = await getAuthPayload(req);
    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const responseId = Number(id);
    if (isNaN(responseId)) {
        return NextResponse.json({ message: 'Invalid response ID' }, { status: 400 });
    }

    try {
        const response = await prisma.response.findUnique({
            where: { id: responseId },
            include: {
                ad: true,
                user: { select: { id: true, email: true } }
            }
        });

        if (!response) {
            return NextResponse.json({ message: 'Response not found' }, { status: 404 });
        }

        if (response.userId !== Number(payload.sub)) {
            return NextResponse.json({ message: 'Forbidden: not your response' }, { status: 403 });
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to fetch response:', error);
        return NextResponse.json({ message: 'Failed to fetch response' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Props> }) {
    const payload = await getAuthPayload(req);
    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const responseId = Number(id);
    if (isNaN(responseId)) {
        return NextResponse.json({ message: 'Invalid response ID' }, { status: 400 });
    }

    try {
        const response = await prisma.response.findUnique({
            where: { id: responseId },
        });

        if (!response) {
            return NextResponse.json({ message: 'Response not found' }, { status: 404 });
        }

        if (response.userId !== Number(payload.sub)) {
            return NextResponse.json({ message: 'Forbidden: not your response' }, { status: 403 });
        }

        const body = await req.json();
        const { message } = body;

        if (typeof message !== 'string' || message.trim() === '') {
            return NextResponse.json({ message: 'Message is required' }, { status: 400 });
        }

        const updatedResponse = await prisma.response.update({
            where: { id: responseId },
            data: { message },
        });

        return NextResponse.json(updatedResponse);
    } catch (error) {
        console.error('Failed to update response:', error);
        return NextResponse.json({ message: 'Failed to update response' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Props> }) {
    const payload = await getAuthPayload(req);
    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const responseId = Number(id);
    if (isNaN(responseId)) {
        return NextResponse.json({ message: 'Invalid response ID' }, { status: 400 });
    }

    try {
        const response = await prisma.response.findUnique({
            where: { id: responseId },
        });

        if (!response) {
            return NextResponse.json({ message: 'Response not found' }, { status: 404 });
        }

        if (response.userId !== Number(payload.sub)) {
            return NextResponse.json({ message: 'Forbidden: not your response' }, { status: 403 });
        }

        await prisma.response.delete({
            where: { id: responseId },
        });

        return NextResponse.json({ message: 'Response deleted successfully' });
    } catch (error) {
        console.error('Failed to delete response:', error);
        return NextResponse.json({ message: 'Failed to delete response' }, { status: 500 });
    }
}

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
    const adId = Number(id);
    if (isNaN(adId)) {
        return NextResponse.json({ message: 'Invalid ad ID' }, { status: 400 });
    }

    try {
        const ad = await prisma.ad.findUnique({
        where: { id: adId },
        include: {
            author: { select: { id: true, email: true } },
            category: { select: { id: true, name: true } },
        },
        });

        if (!ad) {
        return NextResponse.json({ message: 'Ad not found' }, { status: 404 });
        }

        return NextResponse.json(ad);
    } catch (error) {
        console.error('Failed to fetch ad:', error);
        return NextResponse.json({ message: 'Failed to fetch ad' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Props> }) {
    const payload = await getAuthPayload(req);
    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const adId = Number(id);
    if (isNaN(adId)) {
        return NextResponse.json({ message: 'Invalid ad ID' }, { status: 400 });
    }

    try {
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
        });

        if (!ad) {
            return NextResponse.json({ message: 'Ad not found' }, { status: 404 });
        }

        const userId = Number(payload.sub);
        const isModerator = payload.role === 'MODERATOR';

        if (!isModerator && ad.authorId !== userId) {
            return NextResponse.json({ message: 'Forbidden: not your ad' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, price, categoryId } = body;

        if (categoryId) {
            const category = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!category) {
                return NextResponse.json({ message: 'Category not found' }, { status: 400 });
            }
        }

        const updatedAd = await prisma.ad.update({
            where: { id: adId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price }),
                ...(categoryId && { categoryId }),
            },
        });

        return NextResponse.json(updatedAd);
        } catch (error) {
            console.error('Failed to update ad:', error);
            return NextResponse.json({ message: 'Failed to update ad' }, { status: 500 });
        }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<Props> }) {
    const payload = await getAuthPayload(req);
    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const adId = Number(id);
    if (isNaN(adId)) {
        return NextResponse.json({ message: 'Invalid ad ID' }, { status: 400 });
    }

    try {
        const ad = await prisma.ad.findUnique({
        where: { id: adId },
        });

        if (!ad) {
        return NextResponse.json({ message: 'Ad not found' }, { status: 404 });
        }

        const userId = Number(payload.sub);
        const isModerator = payload.role === 'MODERATOR';

        if (!isModerator && ad.authorId !== userId) {
            return NextResponse.json({ message: 'Forbidden: not your ad' }, { status: 403 });
        }

        await prisma.ad.delete({
            where: { id: adId },
        });

        return NextResponse.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        console.error('Failed to delete ad:', error);
        return NextResponse.json({ message: 'Failed to delete ad' }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '@/lib/jwt';

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const payload = token ? await verifyJwt(token) : null;

    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const categoryId = url.searchParams.get('categoryId');
        const minPrice = url.searchParams.get('minPrice');
        const maxPrice = url.searchParams.get('maxPrice');
        const sortByPrice = url.searchParams.get('sortByPrice');

        const where: any = {};

        if (categoryId) {
        const catIdNum = Number(categoryId);
        if (!isNaN(catIdNum)) {
            where.categoryId = catIdNum;
        }
        }

        if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) {
            const min = Number(minPrice);
            if (!isNaN(min)) {
            where.price.gte = min;
            }
        }
        if (maxPrice) {
            const max = Number(maxPrice);
            if (!isNaN(max)) {
            where.price.lte = max;
            }
        }
        }

        const orderBy: any = { date: 'desc' };

        if (sortByPrice && (sortByPrice === 'asc' || sortByPrice === 'desc')) {
        orderBy.price = sortByPrice;
        delete orderBy.date;
        }

        const ads = await prisma.ad.findMany({
        where,
        include: {
            author: {
            select: { id: true, email: true },
            },
            category: {
            select: { id: true, name: true },
            },
        },
        orderBy,
        });

        return NextResponse.json(ads);
    } catch (error) {
        console.error('Failed to fetch ads:', error);
        return NextResponse.json({ message: 'Failed to fetch ads' }, { status: 500 });
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
        const { title, description, categoryId, price } = body;

        if (!title) {
        return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }

        const authorId = Number(payload.sub);

        if (isNaN(authorId)) {
            return NextResponse.json({ message: 'Invalid author ID in token' }, { status: 400 });
        }

        if (categoryId !== undefined && categoryId !== null) {
            const categoryExists = await prisma.category.findUnique({
                where: { id: categoryId },
                select: { id: true },
            });

            if (!categoryExists) {
                return NextResponse.json({ message: 'Category not found' }, { status: 400 });
            }
        }

        const newAd = await prisma.ad.create({
        data: {
            title,
            description: description ?? null,
            categoryId: categoryId ?? null,
            price: price ?? null,
            authorId,
        },
        });

        return NextResponse.json(newAd, { status: 201 });
    } catch (error) {
        console.error('Failed to create ad:', error);
        return NextResponse.json({ message: 'Failed to create ad' }, { status: 500 });
    }
}
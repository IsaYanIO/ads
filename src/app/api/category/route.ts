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
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true
            },
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const payload = token ? await verifyJwt(token) : null;

    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data: { name },
        });

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error('Category creation error:', error);
        return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
    }
}
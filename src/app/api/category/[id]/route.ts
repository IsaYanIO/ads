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
    const categoryId = Number(id);

    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching category' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Props> }) {
    const payload = await getAuthPayload(req);
    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { id } = await params;
    const categoryId = Number(id);
    const body = await req.json();
    const { name } = body;

    if (!name) {
        return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    try {
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { name },
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Props> }) {
    const payload = await getAuthPayload(req);
    if (!payload) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { id } = await params;
    const categoryId = Number(id);

    try {
        await prisma.category.delete({
        where: { id: categoryId },
        });

        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
    }
}



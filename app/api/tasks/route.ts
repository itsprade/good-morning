import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all tasks for user
export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ tasks });
}

// POST create new task
export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await request.json();

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: body.title,
      description: body.description || null,
      priority: body.priority || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      source: body.source || 'manual',
      sourceId: body.sourceId || null,
    },
  });

  return NextResponse.json({ task });
}

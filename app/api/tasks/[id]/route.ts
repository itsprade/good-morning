import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PATCH update task (toggle completed, edit, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await request.json();

  // Verify task belongs to user
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask || existingTask.userId !== user.id) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(body.completed !== undefined && {
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      }),
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.dueDate !== undefined && {
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      }),
    },
  });

  return NextResponse.json({ task });
}

// DELETE task
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  // Verify task belongs to user
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask || existingTask.userId !== user.id) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  await prisma.task.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

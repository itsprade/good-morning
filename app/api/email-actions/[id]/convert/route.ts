import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
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

  // Verify email action belongs to user
  const emailAction = await prisma.emailAction.findUnique({
    where: { id },
  });

  if (!emailAction || emailAction.userId !== user.id) {
    return NextResponse.json({ error: 'Email action not found' }, { status: 404 });
  }

  // Create task from email action
  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: emailAction.suggestedTaskTitle,
      description: emailAction.suggestedDescription,
      priority: emailAction.suggestedPriority,
      dueDate: emailAction.suggestedDueDate,
      source: 'gmail',
      sourceId: emailAction.emailId,
    },
  });

  // Mark email action as converted
  await prisma.emailAction.update({
    where: { id },
    data: {
      status: 'converted',
      convertedToTaskId: task.id,
    },
  });

  return NextResponse.json({ success: true, task });
}

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

  // Mark as dismissed
  const updated = await prisma.emailAction.update({
    where: { id },
    data: { status: 'dismissed' },
  });

  return NextResponse.json({ success: true, emailAction: updated });
}

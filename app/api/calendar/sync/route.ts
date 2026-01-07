import { auth } from '@clerk/nextjs/server';
import { syncCalendar } from '@/lib/google';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const count = await syncCalendar(user.id);

    // Invalidate today's cached summary so it regenerates with new calendar data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailySummary.deleteMany({
      where: {
        userId: user.id,
        date: today,
      },
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

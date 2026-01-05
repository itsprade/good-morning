import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncCalendar } from '@/lib/google';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all users with Google tokens
    const users = await prisma.user.findMany({
      where: {
        googleAccessToken: { not: null },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const results = [];

    for (const user of users) {
      try {
        await syncCalendar(user.id);
        results.push({ userId: user.id, name: user.name, status: 'success' });
      } catch (error) {
        console.error(`Failed to sync calendar for user ${user.id}:`, error);
        results.push({
          userId: user.id,
          name: user.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      syncedUsers: results.length,
      results,
    });
  } catch (error) {
    console.error('Cron sync calendars error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync calendars',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

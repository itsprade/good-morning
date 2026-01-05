import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { syncCalendar } from '@/lib/google';
import { fetchRecentEmails } from '@/lib/gmail';
import { parseEmailsForTasks } from '@/lib/openai';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute

export async function POST() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has Google token
    if (!user.googleAccessToken) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 400 }
      );
    }

    const results = {
      calendar: { status: 'pending' as const, error: null as string | null },
      gmail: { status: 'pending' as const, error: null as string | null, newSuggestions: 0 },
    };

    // Sync Calendar
    try {
      await syncCalendar(user.id);
      results.calendar.status = 'success';
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      results.calendar.status = 'error';
      results.calendar.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Sync Gmail
    try {
      const emails = await fetchRecentEmails(user.id, 50);

      if (emails.length > 0) {
        // Parse with AI
        const tasks = await parseEmailsForTasks(emails);

        // Save suggestions
        let newCount = 0;
        for (const task of tasks) {
          const email = emails.find((e) => e.id === task.emailId);
          if (!email) continue;

          await prisma.emailAction.create({
            data: {
              userId: user.id,
              emailId: email.id,
              subject: email.subject,
              sender: email.from,
              receivedAt: email.date,
              suggestedTaskTitle: task.title,
              suggestedDescription: task.description || null,
              suggestedPriority: task.priority,
              suggestedDueDate: task.dueDate ? new Date(task.dueDate) : null,
              status: 'suggested',
            },
          });

          newCount++;
        }

        results.gmail.status = 'success';
        results.gmail.newSuggestions = newCount;
      } else {
        results.gmail.status = 'success';
      }
    } catch (error) {
      console.error('Failed to sync Gmail:', error);
      results.gmail.status = 'error';
      results.gmail.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Mark user as synced
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Initial sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete initial sync',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncCalendar } from '@/lib/google';
import { fetchRecentEmails } from '@/lib/gmail';
import { parseEmailsForTasks } from '@/lib/openai';

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
      const userResult: any = {
        userId: user.id,
        name: user.name,
        calendar: { status: 'pending' },
        gmail: { status: 'pending' },
      };

      // Sync Calendar
      try {
        await syncCalendar(user.id);
        userResult.calendar = { status: 'success' };
      } catch (error) {
        console.error(`Failed to sync calendar for user ${user.id}:`, error);
        userResult.calendar = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      // Sync Gmail
      try {
        const emails = await fetchRecentEmails(user.id, 50);

        if (emails.length === 0) {
          userResult.gmail = { status: 'no_emails' };
        } else {
          // Parse with AI
          const tasks = await parseEmailsForTasks(emails);

          // Get existing suggestions to avoid duplicates
          const existingActions = await prisma.emailAction.findMany({
            where: {
              userId: user.id,
              status: 'suggested',
            },
            select: {
              emailId: true,
              suggestedTaskTitle: true,
            },
          });

          // Save new suggestions
          let newCount = 0;
          for (const task of tasks) {
            const email = emails.find((e) => e.id === task.emailId);
            if (!email) continue;

            // Check for duplicates
            const isDuplicate = existingActions.some(
              (existing) =>
                existing.emailId === email.id ||
                existing.suggestedTaskTitle.toLowerCase().includes(task.title.toLowerCase().slice(0, 20)) ||
                task.title.toLowerCase().includes(existing.suggestedTaskTitle.toLowerCase().slice(0, 20))
            );

            if (isDuplicate) continue;

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

          userResult.gmail = {
            status: 'success',
            emailsProcessed: emails.length,
            newSuggestions: newCount,
          };
        }
      } catch (error) {
        console.error(`Failed to sync Gmail for user ${user.id}:`, error);
        userResult.gmail = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      results.push(userResult);
    }

    return NextResponse.json({
      success: true,
      syncedUsers: results.length,
      results,
    });
  } catch (error) {
    console.error('Daily sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete daily sync',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { auth } from '@clerk/nextjs/server';
import { fetchRecentEmails } from '@/lib/gmail';
import { parseEmailsForTasks } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    // Check if user has Google tokens
    if (!user.googleAccessToken) {
      return NextResponse.json(
        { error: 'Google account not connected. Please reconnect your Google account.' },
        { status: 400 }
      );
    }

    // Fetch emails from Gmail (50 recent emails)
    const emails = await fetchRecentEmails(user.id, 50);

    if (emails.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No recent emails found' });
    }

    // Parse emails with AI
    const tasks = await parseEmailsForTasks(emails);

    // Save to database (avoid duplicates by checking emailId and similar titles)
    let newCount = 0;
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

    for (const task of tasks) {
      const email = emails.find((e) => e.id === task.emailId);
      if (!email) continue;

      // Check if we already have this email action or a very similar one
      const isDuplicate = existingActions.some(
        (existing) =>
          existing.emailId === email.id ||
          // Check if title is very similar (basic similarity check)
          existing.suggestedTaskTitle.toLowerCase().includes(task.title.toLowerCase().slice(0, 20)) ||
          task.title.toLowerCase().includes(existing.suggestedTaskTitle.toLowerCase().slice(0, 20))
      );

      if (isDuplicate) continue; // Skip duplicates

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

    return NextResponse.json({
      success: true,
      count: newCount,
      total: emails.length,
      message: `Found ${newCount} new action items from ${emails.length} emails`,
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

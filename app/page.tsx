import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { EmailActionCard } from '@/components/email-action-card';
import { TaskItem } from '@/components/task-item';
import { AddTaskForm } from '@/components/add-task-form';
import { SyncButtons } from '@/components/sync-buttons';
import { syncGoogleTokensFromClerk } from '@/lib/clerk-tokens';
import { SignOutButton } from '@/components/sign-out-button';
import { generateDailySummary } from '@/lib/openai';
import { HomeContent } from '@/components/home-content';
import { OnboardingWrapper } from '@/components/onboarding-wrapper';

export default async function HomePage() {
  const { userId: clerkUserId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkUserId) {
    redirect('/sign-in');
  }

  // Get or create user in database
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || '',
        name: clerkUser?.firstName || 'there',
      },
    });
  }

  // Always try to sync Google tokens from Clerk to ensure we have the latest
  try {
    await syncGoogleTokensFromClerk(clerkUserId);
    // Refresh user data
    user = (await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    }))!;
  } catch (error) {
    // Token sync failed - user will see message to reconnect Google
    console.log('Could not sync Google tokens automatically');
  }

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's events
  const events = await prisma.event.findMany({
    where: {
      userId: user.id,
      startTime: { gte: today, lt: tomorrow },
    },
    orderBy: { startTime: 'asc' },
  });

  // Fetch suggested email actions
  const emailActions = await prisma.emailAction.findMany({
    where: {
      userId: user.id,
      status: 'suggested',
    },
    orderBy: { receivedAt: 'desc' },
    take: 5,
  });

  // Fetch tasks
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
  });

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Split active tasks into top 3 and others
  const topThreeTasks = activeTasks.slice(0, 3);
  const otherTasks = activeTasks.slice(3);

  // Get time-based greeting
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  // Check if this is the first time user has Google token and hasn't synced yet
  const needsInitialSync = !!user.googleAccessToken && !user.lastSyncedAt;

  // Get or generate AI daily summary (cached for 24 hours)
  let dailySummary: { bold: string; light: string } | null = null;
  try {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Check if we have a cached summary for today
    let cachedSummary = await prisma.dailySummary.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: todayDate,
        },
      },
    });

    // Generate new summary if not cached
    if (!cachedSummary) {
      const generated = await generateDailySummary({
        meetingsCount: events.length,
        meetings: events.map((e) => ({ title: e.title, startTime: e.startTime })),
        emailActionsCount: emailActions.length,
        emailSubjects: emailActions.map((e) => e.suggestedTaskTitle),
        topTasks: activeTasks.slice(0, 5).map((t) => ({ title: t.title })),
      });

      // Cache the summary
      cachedSummary = await prisma.dailySummary.create({
        data: {
          userId: user.id,
          date: todayDate,
          boldPart: generated.bold,
          lightPart: generated.light,
          meetingsCount: events.length,
          emailActionsCount: emailActions.length,
          tasksCount: activeTasks.length,
        },
      });
    }

    dailySummary = {
      bold: cachedSummary.boldPart,
      light: cachedSummary.lightPart,
    };
  } catch (error) {
    console.error('Failed to generate daily summary:', error);
    // Provide a fallback summary so it's always visible
    dailySummary = {
      bold: `You have ${activeTasks.length} tasks and ${events.length} meetings today.`,
      light: 'Stay focused and make it a productive day!',
    };
  }

  return (
    <>
      {/* Orange Sunrise Gradient at Bottom - SVG-based (matches loader, stays fixed) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <svg
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: '-168px', minWidth: '100vw' }}
          width="1440"
          height="630"
          viewBox="0 0 1440 630"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="filter0_f_110_12_home" x="-278" y="0" width="1996" height="1996" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_110_12"/>
            </filter>
            <filter id="filter1_f_110_12_home" x="-278" y="171" width="1996" height="1996" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_110_12"/>
            </filter>
          </defs>
          <g filter="url(#filter0_f_110_12_home)">
            <circle cx="720" cy="998" r="838" fill="#FF9900"/>
          </g>
          <g filter="url(#filter1_f_110_12_home)">
            <circle cx="720" cy="1169" r="838" fill="#FFC266"/>
          </g>
        </svg>
      </div>

      <OnboardingWrapper
        userName={user.name || 'there'}
        greeting={greeting}
        needsInitialSync={needsInitialSync}
      >
      <HomeContent userName={user.name || 'there'} greeting={greeting}>
      <main className="min-h-screen p-6 sm:p-8 relative overflow-x-hidden" style={{ zIndex: 1 }}>

        <div className="max-w-3xl mx-auto relative z-10">
        {/* Top Actions - Sign Out and Sync Buttons */}
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <SyncButtons hasGoogleToken={!!user.googleAccessToken} />
          <SignOutButton />
        </div>

        {/* Greeting and Summary Section */}
        <div className="pt-[100px]">
          <h1 className="text-sm text-gm-text-secondary font-normal mb-2">
            {greeting}, {user.name || 'there'}
          </h1>

          {/* AI Daily Summary - Always Visible */}
          {dailySummary && (
            <section className="pb-[48px] w-[600px]">
              <p className="text-2xl sm:text-3xl leading-relaxed">
                <span className="font-semibold text-gray-900">{dailySummary.bold}</span>{' '}
                <span className="font-normal text-gray-400">{dailySummary.light}</span>
              </p>
            </section>
          )}
        </div>

        <div className="space-y-8">

        {/* Email Actions - AI Suggested Tasks */}
        {emailActions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                ✨ Suggested from your inbox
              </h2>
              <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {emailActions.length} {emailActions.length === 1 ? 'suggestion' : 'suggestions'}
              </span>
            </div>
            <div className="space-y-3">
              {emailActions.map((action) => (
                <EmailActionCard key={action.id} action={action} />
              ))}
            </div>
          </section>
        )}

        {/* Top 3 Important Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Top 3 important things to do today
            </h2>
            <AddTaskForm />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {topThreeTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-600 font-medium">All clear—no active tasks</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add a task manually or sync Gmail to let AI suggest some
                </p>
              </div>
            ) : (
              <ul className="space-y-1 divide-y divide-gray-50">
                {topThreeTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Other Tasks */}
        {otherTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Other things if you have some time
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <ul className="space-y-1 divide-y divide-gray-50">
                {otherTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Completed Tasks (collapsed) */}
        {completedTasks.length > 0 && (
          <details className="mt-2">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
              {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}
            </summary>
            <div className="bg-gray-50 rounded-xl p-5 mt-3 border border-gray-100">
              <ul className="space-y-1">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </div>
          </details>
        )}

        {/* Calendar */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Your Calendar Today
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-600 font-medium">No meetings today—your time is yours</p>
                <p className="text-sm text-gray-400 mt-2">
                  A clear calendar is a gift. Use it wisely.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {events.map((event) => (
                  <li key={event.id} className="flex gap-4 items-start">
                    <span className="text-sm font-medium text-gray-500 min-w-[70px]">
                      {new Date(event.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-sm text-gray-900 font-medium">{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        </div>
        </div>
      </main>
    </HomeContent>
    </OnboardingWrapper>
    </>
  );
}

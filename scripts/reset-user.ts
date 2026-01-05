import { prisma } from '../lib/prisma';

async function resetUser() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log('No user found');
      return;
    }

    console.log(`Resetting data for user: ${user.email}`);

    // Delete all user data
    await prisma.event.deleteMany({ where: { userId: user.id } });
    await prisma.emailAction.deleteMany({ where: { userId: user.id } });
    await prisma.task.deleteMany({ where: { userId: user.id } });
    await prisma.dailySummary.deleteMany({ where: { userId: user.id } });

    // Reset lastSyncedAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSyncedAt: null },
    });

    console.log('✅ User data reset successfully!');
    console.log('- Deleted all events');
    console.log('- Deleted all email actions');
    console.log('- Deleted all tasks');
    console.log('- Deleted all daily summaries');
    console.log('- Reset lastSyncedAt to null');
    console.log('\nYou can now refresh the page to see the onboarding flow!');
  } catch (error) {
    console.error('Error resetting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUser();

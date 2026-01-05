import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Sync Google OAuth tokens from Clerk to our database
 * Call this when user first logs in or when tokens might be updated
 */
export async function syncGoogleTokensFromClerk(clerkUserId: string) {
  try {
    const client = await clerkClient();

    // Get OAuth tokens from Clerk using the correct method
    const response = await client.users.getUserOauthAccessToken(
      clerkUserId,
      'oauth_google'
    );

    // Check if we got tokens back
    if (!response || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('No Google OAuth tokens found in Clerk for user:', clerkUserId);
      return false;
    }

    const tokenData = response.data[0];

    if (!tokenData || !tokenData.token) {
      console.log('Token data is empty');
      return false;
    }

    // Update tokens in our database
    await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: {
        googleAccessToken: tokenData.token,
        googleRefreshToken: tokenData.token, // Clerk manages refresh internally
      },
    });

    console.log('✅ Successfully synced Google tokens from Clerk');
    return true;
  } catch (error) {
    console.error('Failed to sync Google tokens from Clerk:', error);
    return false;
  }
}

/**
 * Helper to ensure user has Google tokens before making API calls
 */
export async function ensureGoogleTokens() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, googleAccessToken: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If no tokens, try to sync from Clerk
  if (!user.googleAccessToken) {
    const synced = await syncGoogleTokensFromClerk(clerkUserId);
    if (!synced) {
      throw new Error('Google account not connected');
    }
  }

  return user.id;
}

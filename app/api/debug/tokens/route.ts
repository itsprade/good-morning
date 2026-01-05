import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });

    // Get tokens from Clerk
    const client = await clerkClient();
    let clerkTokens = null;
    try {
      const response = await client.users.getUserOauthAccessToken(
        clerkUserId,
        'oauth_google'
      );
      clerkTokens = response.data;
    } catch (error: any) {
      clerkTokens = { error: error.message };
    }

    return NextResponse.json({
      user: {
        ...user,
        googleAccessToken: user?.googleAccessToken
          ? `${user.googleAccessToken.substring(0, 20)}...`
          : null,
        googleRefreshToken: user?.googleRefreshToken
          ? `${user.googleRefreshToken.substring(0, 20)}...`
          : null,
      },
      clerkTokens: clerkTokens
        ? Array.isArray(clerkTokens)
          ? clerkTokens.map((t: any) => ({
              ...t,
              token: t.token ? `${t.token.substring(0, 20)}...` : null,
            }))
          : clerkTokens
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

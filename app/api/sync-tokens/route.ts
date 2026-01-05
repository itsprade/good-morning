import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { syncGoogleTokensFromClerk } from '@/lib/clerk-tokens';

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const synced = await syncGoogleTokensFromClerk(clerkUserId);

    if (!synced) {
      return NextResponse.json(
        { error: 'Failed to sync tokens from Clerk' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Tokens synced successfully' });
  } catch (error: any) {
    console.error('Token sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

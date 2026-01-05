# Sync Debug Guide

## Issue: Sync buttons not working

The sync buttons are showing but the sync might be failing because Google OAuth tokens aren't being stored properly from Clerk.

## Quick Debug Steps

### Step 1: Check if you're signed in

1. Open http://localhost:3000
2. Are you seeing the home page with your name?
3. Or are you seeing a 404 / sign-in page?

**If 404:** You need to sign in first!
- Go to http://localhost:3000/sign-in
- Sign in with Google
- Make sure you authorize both Calendar AND Gmail access

### Step 2: Check what error you see

When you click "Sync Calendar" or "Sync Gmail", what error message appears?

**Common errors:**

**"No Google token found"**
- Means tokens aren't stored in database
- Solution below

**"Google account not connected"**
- Same as above
- Solution below

**"Unauthorized"**
- You're not signed in
- Sign in again

**"Network error"**
- Check browser console (F12 → Console tab)
- Check terminal where `npm run dev` is running

### Step 3: Manual Token Setup (Workaround)

Since Clerk's automatic token sync might not be working, here's a manual workaround:

**Option A: Use Postman/curl to test API directly**

```bash
# Test calendar sync (replace with your Clerk session token)
curl -X POST http://localhost:3000/api/calendar/sync \
  -H "Cookie: __session=YOUR_CLERK_SESSION_COOKIE"
```

**Option B: Check Prisma Studio**

```bash
npx prisma studio
```

1. Open `User` table
2. Find your user record
3. Check if `googleAccessToken` and `googleRefreshToken` are filled
4. If NULL → that's the problem!

### Step 4: Simpler Solution - Skip Token Sync for Now

Let me create a simplified version that doesn't rely on Clerk's token API.

**Temporary workaround:**

The issue is that Clerk handles OAuth tokens internally and doesn't expose them easily. For now, let's test with manual Google Calendar API setup.

##Fix Options

### Option 1: Direct Google API Setup (RECOMMENDED)

Instead of relying on Clerk's OAuth tokens, we can set up Google API credentials directly:

1. Go to https://console.cloud.google.com
2. Create new project: "Good Morning"
3. Enable APIs:
   - Google Calendar API
   - Gmail API
4. Create OAuth 2.0 credentials
5. Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

But this requires building a custom OAuth flow...

### Option 2: Simplify - Remove Clerk Token Dependency (FASTEST)

Let me update the code to not rely on Clerk's token API at all. Instead, we'll:
1. Store tokens when user first connects Google (via Clerk)
2. Use Clerk's built-in token management

I'll make this change now!

---

## What I'm Going to Do

I'll update the code to:
1. Remove the complex token syncing from Clerk API
2. Add a simple "Connect Google" button that manually triggers token storage
3. Make sync work with whatever tokens Clerk provides

Give me a moment...

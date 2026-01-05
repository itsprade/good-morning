# Simple Testing Steps

## Current Status

The app is ready but Google tokens might not be syncing automatically from Clerk. Here's how to test and diagnose:

## Step 1: Check if Page Loads

```bash
# Make sure server is running
npm run dev
```

Visit: http://localhost:3000

**What you should see:**
- If NOT signed in → Redirects to `/sign-in`
- If signed in → Home page with "Good Afternoon, Pradeep"

**If you see 404:**
- Sign in first: http://localhost:3000/sign-in
- Use your Google account

## Step 2: Check Sync Buttons

Once on home page, scroll to bottom.

**You'll see ONE of two things:**

### A) Yellow Warning Box
```
Google Account Not Connected
To sync calendar and emails, make sure you signed in with Google...
```

**This means:** Tokens aren't in database yet.

**Fix:**
1. Sign out (if Clerk has a sign-out button)
2. Sign in again with Google
3. Make sure you click "Allow" for BOTH Calendar AND Gmail permissions

### B) Two Blue/Green Buttons
```
🗓️ Sync Calendar    📧 Sync Gmail
```

**This means:** Tokens are stored! You're ready to test.

## Step 3: Test Manually Adding Tasks

Before testing AI, make sure basic functionality works:

1. Find "+ Add task" button (next to "Your Tasks" header)
2. Click it
3. Type "Test task from UI"
4. Click "Add"
5. ✅ Task should appear
6. ✅ Click checkbox to mark complete
7. ✅ Should move to "completed tasks" section

**If this doesn't work:** There's a bigger issue. Check browser console (F12).

## Step 4: Test Calendar Sync

1. Add an event to your Google Calendar for TODAY
   - Example: "Team Meeting" at 2:00 PM
2. Go back to app
3. Click "🗓️ Sync Calendar"
4. Wait 2-3 seconds
5. ✅ Should see: "✓ Synced 1 calendar events"
6. ✅ Event appears in "Your Calendar Today" section

**If you see error:**
- Check terminal logs where `npm run dev` is running
- Common error: "No Google token found"

## Step 5: Test Gmail Sync (The AI Part!)

**Prep:**
1. Send yourself 2-3 test emails with action items:

**Email 1 (to yourself):**
```
Subject: Review Q1 Budget
Body: Hi, can you please review the Q1 budget document and send feedback by Friday? Thanks!
```

**Email 2:**
```
Subject: Schedule Meeting
Body: Can we schedule a 1:1 meeting next week to discuss the project?
```

**Then test:**
1. Click "📧 Sync Gmail" button
2. Wait 5-10 seconds (AI processing!)
3. ✅ Should see: "✓ Found X new action items from Y emails"
4. ✅ Page refreshes
5. ✅ New section appears: "Suggested from your inbox (2 new)"
6. ✅ See AI-generated task cards with:
   - "AI SUGGESTED TASK" label
   - Task title: "Review Q1 budget"
   - Description: "Need feedback by Friday"
   - From: your_email@gmail.com
   - Due: Friday's date

**If you see error:**
- "Google account not connected" → Tokens not stored (see Step 2)
- "No emails found" → Check you have emails from last 7 days
- "OpenAI error" → Check `OPENAI_API_KEY` in `.env`

## Step 6: Test Email Actions

For each suggested task card:

**Test "Add to tasks":**
1. Click "✓ Add to tasks" button
2. ✅ Card disappears
3. ✅ Task appears in "Your Tasks" section
4. ✅ Shows "📧 From email" badge
5. ✅ Shows due date if AI extracted one

**Test "Dismiss":**
1. Click "→ Dismiss" button on another card
2. ✅ Card fades and shows "Dismissed"
3. ✅ Refresh page → card is gone

## Common Issues & Fixes

### Issue: Yellow warning "Google Account Not Connected"

**Diagnosis:** Google OAuth tokens aren't in database.

**Fix Options:**

**Option 1: Sign out and back in (EASIEST)**
1. Look for Clerk sign-out button (usually top-right)
2. Sign out
3. Sign in again with Google
4. When Clerk asks for permissions, make sure you check BOTH:
   - ✅ Google Calendar
   - ✅ Gmail
5. After sign-in, refresh page
6. Tokens should now be stored

**Option 2: Check Clerk Dashboard**
1. Go to https://dashboard.clerk.com
2. Find your app
3. Go to "OAuth" settings
4. Make sure Google is enabled with these scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
5. If missing, add them and save
6. Sign out of app and sign in again

**Option 3: Manual database update (ADVANCED)**

If you know your Google tokens, you can manually add them:

```bash
npx prisma studio
```

1. Open `User` table
2. Find your user
3. Add your Google access token to `googleAccessToken` field
4. Add refresh token to `googleRefreshToken` field

(You'd get these from Google OAuth Playground or Clerk's API)

### Issue: "OpenAI parsing error"

**Check:**
```bash
cat .env | grep OPENAI
```

Should show:
```
OPENAI_API_KEY=sk-proj-...
```

If missing or wrong:
1. Get key from https://platform.openai.com/api-keys
2. Add to `.env`
3. Restart dev server

### Issue: "No emails found"

**Check:**
- Do you actually have emails in inbox from last 7 days?
- Are you checking the right Gmail account?
- Try sending yourself a test email right now

### Issue: Network errors / timeouts

**Check browser console:**
1. Press F12
2. Go to "Console" tab
3. Look for red errors
4. Share error message for debugging

**Check terminal:**
- Look at terminal where `npm run dev` is running
- Look for errors in red
- Share error for debugging

## Success Criteria

You'll know everything is working when:

1. ✅ Can add tasks manually with "+ Add task"
2. ✅ Can check/uncheck tasks
3. ✅ Can click "Sync Calendar" and see events appear
4. ✅ Can click "Sync Gmail" and see AI suggestions
5. ✅ Can "Add to tasks" from suggestions
6. ✅ Can "Dismiss" suggestions

If ALL of these work → **Day 2 is COMPLETE!** 🎉

## What To Do If Still Broken

1. **Check your `.env` file has all keys:**
```bash
cat .env
```

Should have:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`

2. **Check database connection:**
```bash
npx prisma studio
```

Should open a browser UI. Check:
- `User` table has your user
- Check if `googleAccessToken` is filled

3. **Share the error:**
- What do you see when you click "Sync Gmail"?
- What error message appears?
- Check browser console (F12)
- Check terminal logs

I'll help debug based on the specific error! 🐛

## Quick Diagnostic Commands

```bash
# Check if server is running
curl http://localhost:3000/sign-in

# Check database has users
npx prisma studio

# Check environment variables
cat .env | grep -v "secret_key" | head

# Restart everything fresh
pkill -f "next dev"
npm run dev
```

---

Let me know what you see and I'll help fix it! The most common issue is just that Google tokens aren't syncing from Clerk automatically, which we can work around.

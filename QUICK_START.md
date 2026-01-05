# Quick Start Guide - Good Morning

## Day 1 Progress ✅

You now have a fully functional foundation with:
- Authentication ready (Clerk + Google OAuth)
- Database schema complete (5 models: User, Event, Task, EmailAction, DailySummary)
- Google Calendar sync infrastructure built
- Basic home page with real-time data
- Design system matching your mockup

## Get Running in 10 Minutes

### 1. Install Dependencies (2 min)
```bash
npm install
```

### 2. Set Up Supabase Database (3 min)
1. Go to [supabase.com](https://supabase.com) → Sign up
2. Click "New Project"
3. Choose name: "goodmorning"
4. Set password (save it!)
5. Choose region (closest to you)
6. Wait for setup (~2 min)
7. Go to Settings → Database → Connection String → URI
8. Copy the connection string

### 3. Set Up Clerk Auth (3 min)
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → Sign up
2. Create new application → Name: "Good Morning"
3. Enable Google OAuth:
   - Click "Configure" on Google
   - Click "Enable"
   - In "Scopes" section, add:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/gmail.readonly`
   - Save
4. Copy API keys from "API Keys" tab

### 4. Configure Environment (1 min)
Create `.env` file:

```env
# Paste your Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres"

# Paste your Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Leave these for now (Day 2+)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
CRON_SECRET=your_random_secret_123
```

### 5. Run Migration (30 sec)
```bash
npx prisma migrate dev --name init
```

### 6. Start Development Server (30 sec)
```bash
npm run dev
```

Visit http://localhost:3000 → Sign in with Google!

## What You Can Test Right Now

1. **Sign In**: Click "Sign in with Google" → Authorize
2. **See Your Profile**: Your name appears in greeting
3. **Empty State**: See "No meetings today" and "No tasks yet" messages
4. **Calendar Sync Button**: Click "Sync Calendar" (won't work until you add Google tokens - that's Day 2!)

## What's Next: Day 2 Tasks

Tomorrow we'll add:
1. **Gmail Integration** - Fetch emails and extract action items with AI
2. **OpenAI Parser** - Turn email content into structured tasks
3. **Suggested Tasks UI** - Show AI-extracted tasks with "Add" or "Dismiss" buttons
4. **Task Management** - Add, complete, and delete tasks

### Prep for Day 2 (Optional)
- Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
- Add $5 credit to OpenAI account (you'll spend ~$0.10 during testing)

## Testing Checklist

- [ ] `npm install` completes without errors
- [ ] Database connected (run `npx prisma studio` to verify)
- [ ] Dev server starts at http://localhost:3000
- [ ] Sign in page loads
- [ ] Can sign in with Google
- [ ] After sign-in, see home page with your name
- [ ] See empty states for calendar and tasks
- [ ] Page is mobile responsive (test with DevTools)

## Troubleshooting

**"Invalid client" error during Google sign-in:**
- Go back to Clerk dashboard
- Make sure Google OAuth is enabled
- Add the calendar and gmail scopes
- Try signing in again

**"Can't connect to database" error:**
- Check your `DATABASE_URL` in `.env`
- Make sure Supabase project is active
- Verify password is correct (no special chars that break URLs)
- Try using the connection string from "Connection Pooling" tab instead

**Clerk keys not working:**
- Copy keys again from Clerk dashboard
- Make sure you're using `NEXT_PUBLIC_` prefix for publishable key
- Restart dev server after changing `.env`

**Migration fails:**
- Delete `prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again
- If still fails, check database is empty (no tables)

## File Structure Quick Reference

```
app/
├── page.tsx              ← Main home page (shows calendar + tasks)
├── layout.tsx            ← Root layout (has Clerk provider)
├── api/calendar/sync/    ← Calendar sync API endpoint

lib/
├── prisma.ts             ← Database client (import this everywhere)
├── google.ts             ← Google Calendar helper functions

prisma/
└── schema.prisma         ← Database models (User, Event, Task, etc.)
```

## Quick Commands Reference

```bash
# Development
npm run dev                      # Start dev server

# Database
npx prisma studio               # Visual database browser
npx prisma migrate dev          # Apply schema changes
npx prisma generate             # Regenerate client after schema changes

# Clerk
# Configure at: https://dashboard.clerk.com

# Check logs
# In terminal where npm run dev is running
```

## Day 1 Achievement Unlocked 🎉

You've built the entire foundation in one session! You now have:
- A production-ready auth system
- A scalable database schema
- A beautiful, responsive UI
- Integration infrastructure for Calendar + Gmail

**Tomorrow:** We bring in the AI magic ✨

## Questions or Stuck?

Check the main [README.md](./README.md) for detailed troubleshooting or reach out!

# Setup Checklist - Good Morning

Use this checklist to get your app running. Should take **~10 minutes total**.

## Prerequisites
- [ ] Node.js installed (v18+)
- [ ] npm installed
- [ ] Google account (for OAuth testing)

---

## Step 1: Database Setup (3 minutes)

### Option A: Supabase (Recommended)
- [ ] Go to https://supabase.com
- [ ] Click "Start your project" → Sign up
- [ ] Click "New project"
- [ ] Enter:
  - Name: `goodmorning`
  - Database Password: `[choose strong password]`
  - Region: `[closest to you]`
- [ ] Click "Create new project" (wait ~2 min for setup)
- [ ] Go to Settings → Database
- [ ] Copy "URI" from Connection string section
- [ ] Paste into `.env` as `DATABASE_URL`

### Option B: Local Postgres (Alternative)
```bash
# If you have Docker installed
docker run --name goodmorning-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=goodmorning \
  -p 5432:5432 -d postgres

# Add to .env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/goodmorning"
```

---

## Step 2: Clerk Authentication (3 minutes)

- [ ] Go to https://dashboard.clerk.com
- [ ] Sign up / Log in
- [ ] Click "Add application"
- [ ] Enter name: `Good Morning`
- [ ] Click "Create application"

### Configure Google OAuth
- [ ] In left sidebar, click "OAuth"
- [ ] Find "Google" in list
- [ ] Toggle to enable Google
- [ ] Click on Google to configure
- [ ] Scroll to "Scopes" section
- [ ] Click "Add scope" and add:
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/gmail.readonly`
- [ ] Click "Save" at bottom

### Copy API Keys
- [ ] Click "API Keys" in left sidebar
- [ ] Copy "Publishable key" (starts with `pk_test_`)
- [ ] Copy "Secret key" (starts with `sk_test_`)
- [ ] Save both for next step

---

## Step 3: Environment Variables (1 minute)

- [ ] Create `.env` file in project root
- [ ] Paste this template:

```env
# Database (from Supabase or local)
DATABASE_URL="postgresql://..."

# Clerk (from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# For Day 2+ (leave empty for now)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=

# Random string (any value works)
CRON_SECRET=my_random_secret_123
```

- [ ] Replace `DATABASE_URL` with your connection string
- [ ] Replace `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` with Clerk publishable key
- [ ] Replace `CLERK_SECRET_KEY` with Clerk secret key

---

## Step 4: Install & Migrate (2 minutes)

- [ ] Run: `npm install`
- [ ] Run: `npx prisma migrate dev --name init`
- [ ] Verify migration succeeded (should see "Migration applied" message)

---

## Step 5: Start Development Server (30 seconds)

- [ ] Run: `npm run dev`
- [ ] Open browser to: http://localhost:3000
- [ ] You should see Clerk sign-in page

---

## Step 6: Test Authentication (1 minute)

- [ ] Click "Sign in with Google"
- [ ] Choose your Google account
- [ ] Authorize the app
- [ ] You should be redirected to home page
- [ ] Verify you see: "Good Morning, [Your Name]"

---

## Verification Checklist

Your setup is complete if you can verify:

- [ ] ✅ App loads at http://localhost:3000
- [ ] ✅ Sign-in page appears
- [ ] ✅ Can sign in with Google
- [ ] ✅ Home page shows your name
- [ ] ✅ See "No meetings today" message
- [ ] ✅ See "No tasks yet" message
- [ ] ✅ Page is responsive on mobile width
- [ ] ✅ Design matches mockup (soft gray background, white cards)

---

## Troubleshooting

### "Can't connect to database"
- Check `DATABASE_URL` is correct in `.env`
- If using Supabase, verify project is active (not paused)
- Try running `npx prisma studio` to test connection

### "Invalid Clerk keys"
- Verify you copied both keys correctly
- Check for extra spaces or line breaks
- Make sure publishable key starts with `pk_test_`
- Make sure secret key starts with `sk_test_`
- Restart dev server after changing `.env`

### "OAuth error" during Google sign-in
- Go back to Clerk dashboard
- Verify Google OAuth is enabled (toggle should be on)
- Verify you added both scopes (calendar and gmail)
- Click "Save" after adding scopes
- Try signing in again

### Migration fails
- Delete `prisma/migrations` folder
- Run migration again: `npx prisma migrate dev --name init`
- If still fails, check database is empty (no existing tables)

### Port 3000 already in use
- Kill existing process: `lsof -ti:3000 | xargs kill -9`
- Or use different port: `npm run dev -- -p 3001`

---

## What's Working vs. What's Coming

### ✅ Working Now (Day 1 Complete)
- Authentication with Google
- User creation in database
- Home page with greeting
- Calendar and task UI (empty states)
- Mobile responsive design

### ⏳ Coming Day 2
- Gmail integration
- AI email parsing
- Task suggestions from emails
- Add/dismiss tasks

### ⏳ Coming Day 3
- AI daily summary
- Auto-grouping tasks
- Background sync jobs

### ⏳ Coming Day 4
- Design polish
- Error handling
- Deploy to Vercel

---

## Next Steps After Setup

### For Day 2 Prep (Optional)
If you want to prepare for tomorrow's session:

- [ ] Get OpenAI API key:
  - Go to https://platform.openai.com
  - Create account
  - Add $5 credit
  - Create API key
  - Add to `.env`: `OPENAI_API_KEY=sk-...`

- [ ] Add test calendar events:
  - Add 2-3 meetings to your Google Calendar for tomorrow
  - This will help test calendar sync

- [ ] Send test emails to yourself:
  - "Can you review the Q1 budget by Friday?"
  - "Reminder: Submit expense reports"
  - This will help test AI email parsing

### Explore the Code
- [ ] Open project in VS Code
- [ ] Look at `app/page.tsx` - the home page
- [ ] Look at `prisma/schema.prisma` - the database models
- [ ] Look at `lib/google.ts` - Google Calendar integration
- [ ] Run `npx prisma studio` to see your database

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production (will fail without env vars)

# Database
npx prisma studio             # Open visual database browser
npx prisma migrate dev        # Create new migration
npx prisma generate           # Regenerate Prisma client

# Debugging
npm run dev -- --turbo        # Faster dev mode
```

---

## Success! 🎉

If all checkboxes are checked, you're ready to use Good Morning!

**Day 1 Progress: 100%**

Your app is now:
- ✅ Fully authenticated
- ✅ Connected to database
- ✅ Displaying user-specific data
- ✅ Ready for Day 2 features

See you tomorrow for AI integration! ✨

# Good Morning

Your calm daily companion that helps you wake up with clarity, move through the day with focus, and end with fulfillment.

## Current Status: Day 1 Complete ✅

**What's Working:**
- ✅ Next.js 14 with TypeScript and Tailwind CSS
- ✅ Prisma ORM with full database schema (User, Event, Task, EmailAction, DailySummary)
- ✅ Clerk authentication with Google OAuth ready
- ✅ Google Calendar sync infrastructure
- ✅ Basic home page with time-aware greeting
- ✅ Calendar and task display
- ✅ Mobile-responsive layout with design tokens from mockup

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

You'll need a PostgreSQL database. Quick options:

**Option A: Supabase (Recommended for development)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Copy to `.env` as `DATABASE_URL`

**Option B: Local Postgres**
```bash
# Using Docker
docker run --name goodmorning-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 3. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/goodmorning"

# Clerk (get from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google OAuth (configured in Clerk)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# OpenAI (for Day 2+)
OPENAI_API_KEY=

# Cron Secret (generate random string)
CRON_SECRET=your_random_secret_here
```

### 4. Configure Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create new application
3. Enable **Google** OAuth provider
4. Add custom OAuth scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
5. Copy API keys to `.env`

**Important:** After enabling Google OAuth in Clerk:
- Go to OAuth Settings → Google
- Click "Advanced"
- Add the calendar and gmail scopes above
- Save changes

### 5. Run Database Migration

```bash
npx prisma migrate dev --name init
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Clerk (with Google OAuth)
- **AI:** OpenAI GPT-4o-mini (Day 2+)
- **Integrations:** Google Calendar API, Gmail API (Day 2+)

## Project Structure

```
goodmorning/
├── app/
│   ├── api/                 # API routes
│   │   └── calendar/sync/   # Calendar sync endpoint
│   ├── sign-in/             # Clerk sign-in page
│   ├── sign-up/             # Clerk sign-up page
│   ├── layout.tsx           # Root layout with Clerk provider
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   └── google.ts            # Google API helpers
├── prisma/
│   └── schema.prisma        # Database schema
├── middleware.ts            # Clerk auth middleware
└── tailwind.config.ts       # Tailwind with custom design tokens
```

## Database Schema

### User
- Stores Clerk ID, email, name
- Google OAuth tokens (encrypted by Clerk)

### Event
- Calendar events from Google Calendar
- Linked to User, indexed by startTime

### Task
- Manual and AI-generated tasks
- Source tracking (manual, gmail, linear)
- Priority and due date support

### EmailAction
- AI-suggested tasks from Gmail
- Status: suggested, converted, dismissed

### DailySummary
- AI-generated morning summaries
- Cached per user per day
- Includes context (meetings count, email actions)

## Next Steps (Day 2+)

### Day 2: Gmail AI Analysis
- [ ] Gmail API integration
- [ ] OpenAI email parser (extract action items)
- [ ] Suggested tasks UI with dismiss/convert
- [ ] Task CRUD API endpoints

### Day 3: AI Daily Summary
- [ ] Morning summary generation (analyzes calendar + emails)
- [ ] Two-part summary format (bold + light text)
- [ ] Background sync jobs (Vercel Cron)

### Day 4: Polish + Deploy
- [ ] Design polish (full mockup implementation)
- [ ] Empty states and error handling
- [ ] Mobile responsive refinement
- [ ] Deploy to Vercel

## Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build
npm start

# Database
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma generate        # Regenerate Prisma client

# Linting
npm run lint
```

## Environment Setup Checklist

- [ ] PostgreSQL database created
- [ ] Clerk account created
- [ ] Google OAuth enabled in Clerk
- [ ] Custom scopes added (Calendar + Gmail)
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Dev server running
- [ ] Can sign in with Google
- [ ] User created in database

## Troubleshooting

**"No Google token found" error:**
- Make sure you've enabled Google OAuth in Clerk
- Add calendar and gmail scopes in Clerk's Google OAuth settings
- Re-authenticate to get new tokens with scopes

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check database is running (if local)
- Run `npx prisma migrate dev` to ensure schema is up to date

**Clerk authentication not working:**
- Verify API keys in `.env`
- Check `middleware.ts` is not blocking sign-in routes
- Clear browser cookies and try again

## Design Tokens

Custom Tailwind classes from mockup:

**Colors:**
- `bg-gm-bg` - #F9FAFB (page background)
- `bg-gm-card` - #FFFFFF (card background)
- `text-gm-text-primary` - #111827
- `text-gm-text-secondary` - #6B7280
- `text-gm-text-tertiary` - #9CA3AF

**Spacing:**
- `p-gm-card-padding` - 24px
- `gap-gm-card-gap` - 16px
- `space-y-gm-section-gap` - 40px

**Typography:**
- `text-gm-greeting` - 14px
- `text-gm-summary-bold` - 20px
- `text-gm-summary-light` - 16px
- `text-gm-section-header` - 13px
- `text-gm-task` - 15px

## Cost Estimates

**Development (free tier):**
- Supabase: Free (up to 500MB)
- Clerk: Free (up to 10k MAU)
- Vercel: Free (hobby plan)

**Production (100 users):**
- OpenAI API: ~$2/month
- Supabase: $25/month (if needed)
- Vercel: Free or $20/month (Pro if needed)
- **Total: ~$2-47/month** depending on scale

## License

Private project - All rights reserved

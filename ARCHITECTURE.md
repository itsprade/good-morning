# Good Morning - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Good Morning Web App (Next.js 14)                     │ │
│  │  • React Server Components                             │ │
│  │  • Tailwind CSS + Design Tokens                        │ │
│  │  • Time-aware greeting logic                           │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Next.js Server (Vercel)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication Middleware (Clerk)                     │ │
│  │  • Verify JWT tokens                                   │ │
│  │  • Protect routes                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App Router Pages                                      │ │
│  │  • app/page.tsx (Home)                                 │ │
│  │  • app/sign-in/page.tsx (Auth)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes                                            │ │
│  │  • POST /api/calendar/sync (Day 1)                     │ │
│  │  • POST /api/gmail/sync (Day 2)                        │ │
│  │  • GET  /api/summary/daily (Day 3)                     │ │
│  │  • POST /api/tasks (Day 2)                             │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────┬──────────────────┬──────────────────┬───────────┘
            │                  │                  │
            │                  │                  │
            ▼                  ▼                  ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │    Clerk     │  │   Prisma     │  │   Google     │
   │   (Auth)     │  │    (ORM)     │  │   APIs       │
   └──────────────┘  └──────┬───────┘  └──────────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │  (Supabase)  │
                    └──────────────┘
```

---

## Data Flow: User Sign-In

```
1. User clicks "Sign in with Google"
   ↓
2. Clerk handles OAuth flow
   ↓
3. Google authorizes app (Calendar + Gmail scopes)
   ↓
4. Clerk creates session + JWT token
   ↓
5. App receives user info from Clerk
   ↓
6. Server creates/updates User in database (Prisma)
   ↓
7. User redirected to home page (app/page.tsx)
```

---

## Data Flow: Calendar Sync

```
1. User clicks "Sync Calendar" or cron job triggers
   ↓
2. POST /api/calendar/sync
   ↓
3. Fetch user's Google tokens from database
   ↓
4. Call Google Calendar API with tokens
   ↓
5. Get today's events (startTime, endTime, title)
   ↓
6. Delete old events for today (clean slate)
   ↓
7. Insert new events into database
   ↓
8. Return count of synced events
   ↓
9. Home page re-renders with fresh data
```

---

## Data Flow: AI Email Analysis (Day 2)

```
1. Cron job runs daily (or manual trigger)
   ↓
2. POST /api/gmail/sync
   ↓
3. Fetch last 20 emails from Gmail API
   ↓
4. Send emails to OpenAI GPT-4o-mini
   ↓
5. AI extracts: task title, description, priority, due date
   ↓
6. Create EmailAction records (status: "suggested")
   ↓
7. Home page shows suggested tasks
   ↓
8. User clicks "Add to tasks" or "Dismiss"
   ↓
9. If Add: Create Task record, mark EmailAction as "converted"
   If Dismiss: Mark EmailAction as "dismissed"
```

---

## Data Flow: Daily Summary Generation (Day 3)

```
1. User opens app in morning
   ↓
2. Check if DailySummary exists for today
   ↓
3. If not, generate:
   a. Fetch today's events count
   b. Fetch suggested email actions count
   c. Fetch top 5 tasks
   d. Send to OpenAI with context
   e. AI generates two-part summary (bold + light)
   f. Save to DailySummary table (cached 24 hours)
   ↓
4. Display summary at top of home page
```

---

## Database Schema (Entity Relationship)

```
┌──────────────┐
│     User     │
│──────────────│
│ id (PK)      │◄──────┐
│ clerkId      │       │
│ email        │       │
│ name         │       │
│ googleTokens │       │
└──────────────┘       │
                       │
       ┌───────────────┼───────────────┬───────────────┐
       │               │               │               │
       │               │               │               │
       ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Event    │ │    Task     │ │EmailAction  │ │DailySummary │
│─────────────│ │─────────────│ │─────────────│ │─────────────│
│ id (PK)     │ │ id (PK)     │ │ id (PK)     │ │ id (PK)     │
│ userId (FK) │ │ userId (FK) │ │ userId (FK) │ │ userId (FK) │
│ title       │ │ title       │ │ emailId     │ │ date        │
│ startTime   │ │ description │ │ subject     │ │ summaryText │
│ endTime     │ │ completed   │ │ sender      │ │ meetingsCount│
│ meetingLink │ │ source      │ │ suggested   │ │ emailCount  │
│ googleId    │ │ priority    │ │ status      │ └─────────────┘
└─────────────┘ │ dueDate     │ └─────────────┘
                └─────────────┘
```

---

## Authentication Flow (Clerk)

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│    Clerk     │◄─────►│    Google    │
│  Dashboard   │       │    OAuth     │
└──────┬───────┘       └──────────────┘
       │
       │ Issues JWT token
       │
       ▼
┌──────────────┐
│  middleware  │
│    .ts       │
│ (verifies    │
│  JWT)        │
└──────┬───────┘
       │
       │ Attaches userId
       │
       ▼
┌──────────────┐
│  App Routes  │
│  (protected) │
└──────────────┘
```

---

## API Endpoint Design

### Authentication
- **Provider:** Clerk
- **Flow:** OAuth 2.0 via Google
- **Scopes:**
  - `openid` (user identity)
  - `email` (user email)
  - `profile` (user name)
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/gmail.readonly`

### API Routes

#### Day 1 Endpoints
```
POST /api/calendar/sync
  Headers: Authorization (Clerk JWT)
  Returns: { success: true, count: 3 }
  Error:   { error: "No Google token found" }
```

#### Day 2 Endpoints
```
POST /api/gmail/sync
  Headers: Authorization
  Returns: { success: true, count: 5 }

POST /api/tasks
  Body:    { title, description?, priority?, dueDate? }
  Returns: { id, title, ... }

PATCH /api/tasks/:id
  Body:    { completed: true }
  Returns: { id, completed: true }

POST /api/email-actions/:id/dismiss
  Returns: { success: true }

POST /api/email-actions/:id/convert
  Returns: { taskId: "..." }
```

#### Day 3 Endpoints
```
GET /api/summary/daily?date=2026-01-05
  Returns: { summary: "You have four meetings..." }

GET /api/summary/yesterday?date=2026-01-04
  Returns: { completedCount: 6, reflection: "..." }
```

---

## External API Integrations

### Google Calendar API
- **Endpoint:** `calendar.googleapis.com/v3`
- **Method:** `calendar.events.list()`
- **Rate Limit:** 1,000,000 queries/day
- **Auth:** OAuth 2.0 (stored in User table)

### Gmail API
- **Endpoint:** `gmail.googleapis.com/v1`
- **Methods:**
  - `users.messages.list()` - Get message IDs
  - `users.messages.get()` - Get full message
- **Rate Limit:** 1,000,000 queries/day
- **Auth:** OAuth 2.0 (stored in User table)

### OpenAI API
- **Endpoint:** `api.openai.com/v1`
- **Model:** `gpt-4o-mini`
- **Methods:**
  - `chat.completions.create()` - All AI features
- **Rate Limit:** 10,000 requests/min (Tier 1)
- **Auth:** API key (env variable)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Vercel Edge Network                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Static Assets (CSS, JS, images)                       │ │
│  │  • Cached globally                                      │ │
│  │  • Auto-optimized images                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Serverless Functions (API Routes)                     │ │
│  │  • Auto-scaling                                         │ │
│  │  • Cold start: ~200ms                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        │
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Database)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 15                                         │ │
│  │  • Connection pooling (PgBouncer)                       │ │
│  │  • Auto-backups (daily)                                 │ │
│  │  • SSL encrypted                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Data Encryption
- **In Transit:** TLS 1.3 (HTTPS)
- **At Rest:** AES-256 (Supabase default)
- **Google Tokens:** Encrypted by Clerk
- **API Keys:** Environment variables (never in code)

### Authentication
- **JWT Tokens:** Signed by Clerk (RS256)
- **Token Expiration:** 1 hour (auto-refresh)
- **Session Storage:** HTTP-only cookies

### Authorization
- **Row-Level Security:** All queries filtered by userId
- **API Middleware:** Verifies Clerk JWT on every request
- **OAuth Scopes:** Read-only access (Calendar + Gmail)

### Privacy
- **Email Storage:** Only metadata (subject, sender, date)
- **Email Body:** Sent to AI, never stored
- **Data Deletion:** Cascade delete on user removal
- **GDPR Ready:** User can delete all data anytime

---

## Performance Optimization

### Database
- **Indexes:**
  - `Event(userId, startTime)` - Fast today's events query
  - `Task(userId, completed)` - Fast active tasks query
  - `EmailAction(userId, status)` - Fast suggested tasks query
  - `DailySummary(userId, date)` - Fast summary lookup

### Caching Strategy
- **Daily Summary:** 24-hour cache (regenerate at midnight)
- **Static Assets:** CDN cache (forever with cache busting)
- **API Responses:** No caching (real-time data)

### Code Splitting
- **Route-based:** Each page loads independently
- **Component-based:** Heavy components lazy-loaded
- **Third-party:** Clerk SDK loaded on-demand

---

## Monitoring & Observability (Day 4+)

### Logging
- **Vercel:** Automatic request logs
- **Console:** Errors logged to Vercel dashboard
- **Clerk:** Auth events tracked in dashboard

### Metrics to Track
- **User:** Sign-ups, daily active users, retention
- **Performance:** Page load time, API response time
- **AI:** OpenAI token usage, cost per user
- **Errors:** 4xx/5xx rates, failed API calls

### Alerts to Set Up
- **High error rate** (> 5% of requests fail)
- **Slow API** (> 5s response time)
- **High AI cost** (> $10/day unexpected)
- **Database down** (connection failures)

---

## Scaling Plan

### Current Capacity
- **Users:** 10,000 (Clerk free tier)
- **Database:** 500MB / 2GB bandwidth (Supabase free)
- **Serverless:** Auto-scales to demand (Vercel)

### At 1,000 Daily Active Users
- **Database:** Upgrade to Supabase Pro ($25/mo)
- **Vercel:** Stay on free tier (likely sufficient)
- **OpenAI:** ~$20/mo (GPT-4o-mini)
- **Clerk:** Still free tier

### At 10,000 Daily Active Users
- **Database:** Supabase Pro (may need Team $99/mo)
- **Vercel:** Pro plan ($20/mo)
- **OpenAI:** ~$200/mo
- **Clerk:** Still free tier
- **Total:** ~$320/mo

### Optimization Strategies
1. **Batch AI calls** (process multiple emails at once)
2. **Cache aggressively** (daily summaries, task groups)
3. **Queue background jobs** (use Inngest or BullMQ)
4. **CDN for static assets** (Vercel handles automatically)

---

## Technology Choices Summary

| Layer          | Technology     | Why Chosen                        |
|----------------|----------------|-----------------------------------|
| Frontend       | Next.js 14     | Best React framework, fast DX     |
| Styling        | Tailwind CSS   | Rapid prototyping, design tokens  |
| Auth           | Clerk          | Fastest OAuth setup, great DX     |
| Database       | PostgreSQL     | Production-grade, relational      |
| ORM            | Prisma         | Type-safe, great migrations       |
| AI             | OpenAI         | Best cost/performance ratio       |
| Hosting        | Vercel         | One-click deploy, serverless      |
| Calendar       | Google API     | Industry standard, reliable       |
| Email          | Gmail API      | Same auth as calendar, widely used|

---

## Future Architecture (Mobile App)

```
┌─────────────────┐         ┌─────────────────┐
│  iOS App        │         │  Android App    │
│  (React Native) │         │  (React Native) │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │    Same API Endpoints     │
         │                           │
         └──────────┬────────────────┘
                    │
                    ▼
         ┌─────────────────┐
         │  Next.js Server │ ← No changes needed!
         │  (API Routes)   │
         └─────────────────┘
```

**Key Point:** Backend is already mobile-ready. Just need to build native UI.

---

## Conclusion

The architecture is:
- ✅ **Scalable:** Serverless + auto-scaling DB
- ✅ **Secure:** JWT auth + encrypted tokens + SSL
- ✅ **Fast:** Indexed queries + CDN + caching
- ✅ **Cost-effective:** Free tier up to 1,000 users
- ✅ **Mobile-ready:** REST API, JWT auth works everywhere
- ✅ **Maintainable:** TypeScript + Prisma + clear structure

Ready for production! 🚀

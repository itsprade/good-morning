# Good Morning - Deployment Guide

## Prerequisites

1. **Vercel Account** - [Sign up](https://vercel.com/signup)
2. **PostgreSQL Database** - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Supabase](https://supabase.com/)
3. **Clerk Account** - [Sign up](https://clerk.com/)
4. **Google Cloud Project** with OAuth credentials
5. **OpenAI API Key**

## Environment Variables

Create these environment variables in Vercel:

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# OpenAI
OPENAI_API_KEY="sk-..."

# Cron Secret (generate a random string)
CRON_SECRET="your-secret-random-string-here"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Calendar API** and **Gmail API**
4. Configure OAuth consent screen:
   - User Type: External
   - Scopes: `calendar.readonly`, `gmail.readonly`, `userinfo.email`, `userinfo.profile`
   - Add test users (your email)
5. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `https://YOUR-CLERK-DOMAIN.clerk.accounts.dev/v1/oauth_callback`
6. Copy Client ID and Client Secret to Clerk dashboard

## Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Enable Google OAuth:
   - Go to **SSO Connections** → **Google**
   - Toggle "Use custom credentials"
   - Paste your Google Client ID and Client Secret
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/gmail.readonly`
4. Copy your Clerk keys to environment variables

## Database Setup

1. Create a PostgreSQL database (Vercel Postgres recommended)
2. Copy the connection string
3. Run migrations:

```bash
npx prisma migrate deploy
```

## Deploy to Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

4. Redeploy after setting env vars:

```bash
vercel --prod
```

## Verify Deployment

1. Visit your deployment URL
2. Sign in with Google
3. Approve Calendar and Gmail permissions
4. Click "Sync Calendar" and "Sync Gmail"
5. Verify data appears

## Cron Jobs

Vercel Cron is configured in `vercel.json`:
- Calendar sync: Every 15 minutes
- Gmail sync: Daily at 6 AM

These run automatically on Vercel. No additional setup required!

## Troubleshooting

### "Sync failed" error
- Check that Google OAuth scopes are correct in Clerk
- Verify Google APIs are enabled in Cloud Console
- Make sure test user is added in OAuth consent screen

### Database connection errors
- Verify DATABASE_URL is correct
- Run `npx prisma migrate deploy`
- Check Prisma schema matches database

### Cron jobs not running
- Verify CRON_SECRET is set
- Check Vercel Function logs in dashboard
- Ensure you're on a paid Vercel plan (Hobby or Pro)

## Support

For issues, check:
- [Clerk Documentation](https://clerk.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

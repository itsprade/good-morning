# Day 2 Testing Guide

## What We Built Today

✅ **Complete AI Email Analysis System**
- Gmail API integration (fetches last 20 emails)
- OpenAI GPT-4o-mini parser (extracts actionable tasks)
- Email action suggestions with dismiss/convert buttons
- Task CRUD (create, read, update, delete)
- Manual task creation form
- Interactive task checkboxes
- Completed tasks section (collapsible)

## Testing Steps

### Step 1: Restart Dev Server

```bash
# Kill any running process
pkill -f "next dev"

# Start fresh
npm run dev
```

Visit http://localhost:3000

###Step 2: Check Home Page

You should see:
- ✅ "Good Afternoon, Pradeep" (time-aware greeting)
- ✅ Calendar section (empty or with events)
- ✅ Tasks section with "+ Add task" button
- ✅ Two sync buttons: "🗓️ Sync Calendar" and "📧 Sync Gmail"

### Step 3: Test Manual Task Creation

1. Click "+ Add task"
2. Type "Test task from UI"
3. Click "Add"
4. ✅ Task should appear in the list
5. ✅ Click checkbox to mark complete
6. ✅ Task moves to "completed tasks" section

### Step 4: Send Test Emails to Yourself

Send 2-3 emails to your Gmail account with action items:

**Email 1:**
```
Subject: Review Q1 Budget
Body: Hi, can you please review the Q1 budget document and send feedback by Friday? Thanks!
```

**Email 2:**
```
Subject: Reminder: Submit Expense Reports
Body: Don't forget to submit your expense reports by end of this week.
```

**Email 3:**
```
Subject: Schedule 1:1 Meeting
Body: Can we schedule a 1:1 meeting for next week to discuss the project roadmap?
```

### Step 5: Sync Gmail

1. Click "📧 Sync Gmail" button
2. Wait 5-10 seconds (AI is processing)
3. ✅ Should see message: "✓ Found X new action items from Y emails"
4. ✅ Page refreshes automatically
5. ✅ New section appears: "Suggested from your inbox (X new)"

### Step 6: Test Email Actions

For each suggested task:
1. ✅ See "AI SUGGESTED TASK" label
2. ✅ See task title (e.g., "Review Q1 budget")
3. ✅ See description (e.g., "Sarah needs feedback by Friday")
4. ✅ See "From:" email sender
5. ✅ See "Due:" date if mentioned
6. ✅ See priority level

**Test "Add to tasks":**
1. Click "✓ Add to tasks" on one suggestion
2. ✅ Suggestion disappears
3. ✅ Task appears in "Your Tasks" section
4. ✅ Task shows "📧 From email" badge

**Test "Dismiss":**
1. Click "→ Dismiss" on another suggestion
2. ✅ Card fades out and shows "Dismissed"
3. ✅ Disappears after refresh

### Step 7: Test Calendar Sync (if you have events)

1. Add 1-2 events to your Google Calendar for today
2. Click "🗓️ Sync Calendar" button
3. ✅ Should see: "✓ Synced X calendar events"
4. ✅ Events appear in Calendar section

## Troubleshooting

### "Google account not connected" error

This means Clerk hasn't synced Google OAuth tokens yet.

**Fix:**
1. Sign out of the app
2. Sign in again with Google
3. Make sure you authorize Calendar AND Gmail access
4. Try syncing again

### "OpenAI parsing error" in console

Check:
- `OPENAI_API_KEY` is set in `.env`
- API key is valid (starts with `sk-`)
- You have credits in your OpenAI account

### No emails found

Check:
- You actually have emails in your inbox from the last 7 days
- Gmail API is enabled in Clerk (both scopes)
- Try sending test emails to yourself

### AI not extracting tasks correctly

This is expected! AI is probabilistic. It should catch:
- ✅ Clear action items ("can you review...", "please send...")
- ✅ Deadlines ("by Friday", "end of week")
- ✅ Reminders ("don't forget...")

It might miss:
- ❌ Very vague emails
- ❌ Emails without clear actions
- ❌ FYI/informational emails (this is good - we want to filter these out!)

## What to Expect

### Good Results:
- 30-50% of your recent emails become suggested tasks
- Clear, actionable task titles
- Correct priority levels (high for deadlines, medium for requests)
- Reasonable due dates extracted

### Expected Limitations:
- Some false positives (emails that aren't really tasks)
- Some missed tasks (AI isn't perfect)
- Due dates might be off if email uses relative terms ("next week")
- Descriptions might be too short or too long

## API Endpoints Working

You can test these directly:

```bash
# Sync Gmail (requires auth)
curl -X POST http://localhost:3000/api/gmail/sync \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task from API"}'

# Toggle task completion
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Dismiss email action
curl -X POST http://localhost:3000/api/email-actions/ACTION_ID/dismiss

# Convert email action to task
curl -X POST http://localhost:3000/api/email-actions/ACTION_ID/convert
```

## Database Check

View your data in Prisma Studio:

```bash
npx prisma studio
```

You should see:
- ✅ `User` table with your account
- ✅ `Event` table with calendar events (if synced)
- ✅ `Task` table with manual and email-derived tasks
- ✅ `EmailAction` table with suggested tasks

## Success Criteria

Day 2 is complete if you can:

1. ✅ Click "Sync Gmail" and see suggested tasks
2. ✅ Click "Add to tasks" and task appears in your list
3. ✅ Click checkbox to complete a task
4. ✅ Click "+ Add task" to create tasks manually
5. ✅ See email suggestions with AI-generated titles/descriptions

## Known Issues (By Design)

- **Token sync delay:** First time signing in, Google tokens might not sync immediately. Sign out and back in if sync buttons don't work.
- **No real-time sync:** You must click "Sync Gmail" manually. Background jobs come in Day 3.
- **Duplicate detection:** Running sync twice won't create duplicates (we check `emailId`).
- **No email body storage:** We only send email content to OpenAI, never store it (privacy!).

## What's Next: Day 3

Tomorrow we'll add:
- ✅ AI daily summary (analyzes your day and writes a personalized briefing)
- ✅ Auto-grouping tasks ("Top 3 important things", "Quick wins", etc.)
- ✅ Background sync jobs (every 15 minutes)
- ✅ Yesterday recap widget

## Cost Check

After testing, check your OpenAI usage:
- Go to https://platform.openai.com/usage
- Should see ~$0.01-0.05 spent (very cheap with GPT-4o-mini!)
- Each Gmail sync with 20 emails = ~$0.002

---

## Quick Test Checklist

- [ ] Dev server running
- [ ] Can load home page
- [ ] "+ Add task" button works
- [ ] Manual task appears in list
- [ ] Checkbox toggles task completion
- [ ] "Sync Gmail" button visible
- [ ] Sent test emails to myself
- [ ] Click "Sync Gmail" works
- [ ] AI suggestions appear
- [ ] "Add to tasks" converts suggestion
- [ ] "Dismiss" removes suggestion
- [ ] Task from email shows "📧" badge
- [ ] Completed tasks collapse into separate section

All checked? **Day 2 COMPLETE!** 🎉

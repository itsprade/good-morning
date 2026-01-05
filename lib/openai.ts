import OpenAI from 'openai';
import { Email } from './gmail';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedTask {
  emailId: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string; // ISO date string
}

export async function parseEmailsForTasks(emails: Email[]): Promise<ParsedTask[]> {
  if (emails.length === 0) return [];

  // Format emails for AI
  const emailsText = emails
    .map(
      (e, i) =>
        `Email ${i + 1} (ID: ${e.id}):
From: ${e.from}
Subject: ${e.subject}
Body: ${e.body}
---`
    )
    .join('\n\n');

  const prompt = `You are analyzing emails to extract actionable tasks for the email recipient.

For each email below, determine if it contains ANY action items or tasks that need to be done BY THE RECIPIENT (not by the sender or others).

**What to look for:**
1. **Direct requests**: "Can you...", "Please...", "Could you...", "Would you mind...", "Don't forget to..."
2. **Deadlines or time constraints**: "by Friday", "before EOD", "ASAP", "this week"
3. **Action verbs directed at recipient**: review, send, submit, approve, schedule, reply, confirm, update, check, prepare, complete
4. **Questions that need responses**: Any question mark directed at recipient
5. **Follow-ups needed**: "waiting for your feedback", "let me know", "get back to me"
6. **Reminders or notifications** that require action: shipping confirmations to track, bills to pay, appointments to confirm
7. **Meeting invites or schedule requests**
8. **Documents to review or sign**
9. **Implicit actions**: Sometimes the action is implied (e.g., "Here's the doc" might mean "review this doc")

**What to ignore:**
- Pure informational emails (newsletters, updates) UNLESS they contain specific actions
- Emails where YOU are the sender (unless it's a reminder to yourself)
- Automated notifications that don't need action
- Marketing emails without specific requests

**Extract:**
- **Title**: Clear, actionable, starts with verb, max 50 chars (e.g., "Review Q1 budget proposal", "Reply to client inquiry")
- **Description**: Context from email, 1-2 sentences max, who sent it and what they need
- **Priority**:
  - "high": Explicit urgency words (urgent, ASAP, deadline today/tomorrow), from boss/important person
  - "medium": General requests, questions, tasks with deadlines in next few days
  - "low": FYIs with optional actions, no deadline mentioned
- **Due date**: Format YYYY-MM-DD. If relative (e.g., "Friday", "next Monday", "EOD"), calculate from today: ${new Date().toISOString().split('T')[0]}

**Be generous - if there's any chance something needs action, include it. Better to suggest too many than miss important tasks.**

IMPORTANT: Return valid JSON only:
{
  "tasks": [
    {
      "emailId": "email_id_here",
      "title": "Review Q1 budget proposal",
      "description": "Sarah from Finance needs feedback by Friday",
      "priority": "high",
      "dueDate": "2026-01-10"
    }
  ]
}

If absolutely NO actionable tasks found, return: {"tasks": []}

Emails to analyze:
${emailsText}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You extract actionable tasks from emails for the recipient. Return only valid JSON. Be generous - capture all potential action items.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{"tasks": []}';
    const parsed = JSON.parse(content);

    return parsed.tasks || [];
  } catch (error) {
    console.error('OpenAI parsing error:', error);
    return [];
  }
}

export async function generateDailySummary({
  meetingsCount,
  meetings,
  emailActionsCount,
  topTasks,
}: {
  meetingsCount: number;
  meetings: Array<{ title: string; startTime: Date }>;
  emailActionsCount: number;
  topTasks: Array<{ title: string }>;
}): Promise<{ bold: string; light: string }> {
  const meetingsList = meetings
    .slice(0, 5)
    .map(
      (m) =>
        `${m.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${m.title}`
    )
    .join('\n');

  const tasksList = topTasks.slice(0, 5).map((t) => t.title).join('\n');

  const prompt = `You are a calm, encouraging daily companion. Generate a two-part morning summary:

PART 1 (bold, direct): 1-2 sentences assessing today's shape (meetings, tasks, workload)
PART 2 (light, philosophical): 1-2 sentences giving gentle direction and encouragement

Context:
- Meetings today: ${meetingsCount}
${meetingsList ? `Meeting details:\n${meetingsList}` : 'No meetings scheduled'}
- New action items from inbox: ${emailActionsCount}
${tasksList ? `- Top tasks:\n${tasksList}` : '- No tasks yet'}

Tone: Warm, human, encouraging. Like a wise friend checking in. No jargon. No mention of "system" or "app".

Examples:
"Your day looks a bit tight today, I have cleaned up some tasks and planned some items to execute. Wake up knowing what matters, move through your day with ease, and close it with a sense of completion."

"Just two meetings today and your inbox is clear. This is a good day to make real progress on what matters most. Pick one thing and give it your full attention."

"Today is packed—six meetings back to back starting at 9am. Protect 30 minutes this morning for your top priority, then let the meetings flow. You'll get through it."

Format as JSON:
{
  "boldPart": "Your day looks...",
  "lightPart": "Wake up knowing..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a calm daily companion. Return only valid JSON with encouraging, human language.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    return {
      bold: parsed.boldPart || 'Your day is ready.',
      light: parsed.lightPart || 'Take it one step at a time.',
    };
  } catch (error) {
    console.error('Summary generation error:', error);
    return {
      bold: 'Your day is ready.',
      light: 'Take it one step at a time.',
    };
  }
}

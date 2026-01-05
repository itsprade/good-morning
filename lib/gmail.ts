import { google } from 'googleapis';
import { getGoogleClient } from './google';

export interface Email {
  id: string;
  subject: string;
  from: string;
  date: Date;
  snippet: string;
  body: string;
}

export async function fetchRecentEmails(
  userId: string,
  maxResults = 50
): Promise<Email[]> {
  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });

  // Get messages from last 7 days in inbox
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const query = `in:inbox after:${Math.floor(sevenDaysAgo.getTime() / 1000)}`;

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messages = response.data.messages || [];
    const emails: Email[] = [];

    for (const message of messages) {
      if (!message.id) continue;

      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
      const dateHeader = headers.find((h) => h.name === 'Date')?.value || '';

      // Get email body
      const snippet = detail.data.snippet || '';
      let body = snippet;

      // Try to get full body from payload
      const parts = detail.data.payload?.parts || [];
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }

      // If no parts, check main body
      if (body === snippet && detail.data.payload?.body?.data) {
        body = Buffer.from(detail.data.payload.body.data, 'base64').toString('utf-8');
      }

      emails.push({
        id: message.id,
        subject,
        from,
        date: new Date(dateHeader),
        snippet,
        body: body.slice(0, 1500), // Increased to 1500 chars for better AI understanding
      });
    }

    return emails;
  } catch (error) {
    console.error('Gmail fetch error:', error);
    throw new Error('Failed to fetch emails from Gmail');
  }
}

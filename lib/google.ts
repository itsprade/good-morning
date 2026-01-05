import { google } from 'googleapis';
import { prisma } from './prisma';

export async function getGoogleClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleAccessToken: true, googleRefreshToken: true },
  });

  if (!user?.googleAccessToken) {
    throw new Error('No Google token found');
  }

  // Create a simple OAuth2 client with just the access token
  // No client ID/secret needed since Clerk manages the OAuth flow
  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
  });

  return oauth2Client;
}

export async function syncCalendar(userId: string) {
  const auth = await getGoogleClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: today.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];

  // Delete old events for today
  await prisma.event.deleteMany({
    where: {
      userId,
      startTime: { gte: today, lt: tomorrow },
    },
  });

  // Insert new events
  for (const event of events) {
    const startTime = event.start?.dateTime || event.start?.date;
    const endTime = event.end?.dateTime || event.end?.date;

    if (!startTime || !endTime) continue;

    await prisma.event.create({
      data: {
        userId,
        title: event.summary || 'Untitled Event',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingLink: event.hangoutLink || null,
        googleEventId: event.id || '',
      },
    });
  }

  return events.length;
}

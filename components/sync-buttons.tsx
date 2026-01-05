'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SyncButtons({ hasGoogleToken }: { hasGoogleToken: boolean }) {
  const [syncing, setSyncing] = useState<'calendar' | 'gmail' | null>(null);
  const router = useRouter();

  const handleCalendarSync = async () => {
    setSyncing('calendar');

    try {
      const res = await fetch('/api/calendar/sync', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Calendar sync error:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleGmailSync = async () => {
    setSyncing('gmail');

    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Gmail sync error:', error);
    } finally {
      setSyncing(null);
    }
  };

  if (!hasGoogleToken) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {/* Calendar Sync Icon */}
      <button
        onClick={handleCalendarSync}
        disabled={syncing !== null}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Sync Calendar"
      >
        {syncing === 'calendar' ? (
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>

      {/* Gmail Sync Icon */}
      <button
        onClick={handleGmailSync}
        disabled={syncing !== null}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Sync Gmail"
      >
        {syncing === 'gmail' ? (
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

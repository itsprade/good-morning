'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EmailAction {
  id: string;
  emailId: string;
  subject: string;
  sender: string;
  receivedAt: Date;
  suggestedTaskTitle: string;
  suggestedDescription: string | null;
  suggestedPriority: string | null;
  suggestedDueDate: Date | null;
  status: string;
}

export function EmailActionCard({ action }: { action: EmailAction }) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  const handleDismiss = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email-actions/${action.id}/dismiss`, {
        method: 'POST',
      });

      if (res.ok) {
        setDismissed(true);
        setTimeout(() => router.refresh(), 500);
      }
    } catch (error) {
      console.error('Failed to dismiss:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email-actions/${action.id}/convert`, {
        method: 'POST',
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-50">
        <p className="text-sm text-gray-500">Dismissed</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="text-xs text-blue-600 uppercase font-semibold tracking-wide mb-2">
            AI Suggested Task
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 text-base">
            {action.suggestedTaskTitle}
          </h3>
          {action.suggestedDescription && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {action.suggestedDescription}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>From: {action.sender.split('<')[0].trim()}</span>
            {action.suggestedDueDate && (
              <>
                <span>·</span>
                <span>
                  Due: {new Date(action.suggestedDueDate).toLocaleDateString()}
                </span>
              </>
            )}
            {action.suggestedPriority && (
              <>
                <span>·</span>
                <span className="capitalize">{action.suggestedPriority} priority</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleDismiss}
          disabled={loading}
          className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors font-medium"
        >
          → Dismiss
        </button>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 transition-colors"
        >
          ✓ Add to tasks
        </button>
      </div>
    </div>
  );
}

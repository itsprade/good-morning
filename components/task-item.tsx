'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  source: string;
  priority: string | null;
  dueDate: Date | null;
}

export function TaskItem({ task }: { task: Task }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex items-start gap-3 py-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        disabled={loading}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer disabled:opacity-50"
      />
      <div className="flex-1">
        <span
          className={`text-gm-task ${
            task.completed ? 'line-through text-gray-400' : 'text-gm-text-primary'
          }`}
        >
          {task.title}
        </span>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
        )}
        {(task.dueDate || task.source !== 'manual') && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            {task.source === 'gmail' && <span>📧 From email</span>}
            {task.dueDate && (
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

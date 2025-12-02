'use client';

import { useNotifications } from '@/context/NotificationContext';

interface NotificationBadgeProps {
    type: 'messages' | 'ideas';
    userId?: string; // Kept for compatibility but not used with context
}

export default function NotificationBadge({ type }: NotificationBadgeProps) {
    const { unreadMessages, newIdeas } = useNotifications();

    const count = type === 'messages' ? unreadMessages : newIdeas;

    if (count === 0) return null;

    return (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-in zoom-in duration-200">
            {count > 99 ? '99+' : count}
        </span>
    );
}

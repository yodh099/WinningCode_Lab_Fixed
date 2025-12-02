'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useState } from 'react';
import Link from 'next/link';

export default function NotificationBell() {
    const { totalNotifications, unreadMessages, newIdeas } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-6 w-6" />
                {totalNotifications > 0 && (
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-indigo-900"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    </div>
                    <div className="py-2">
                        {totalNotifications === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No new notifications
                            </div>
                        ) : (
                            <>
                                {unreadMessages > 0 && (
                                    <Link
                                        href="/en/admin/messages"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <span className="h-2 w-2 bg-blue-500 rounded-full mr-3"></span>
                                            <span className="text-sm text-gray-700">New Messages</span>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {unreadMessages}
                                        </span>
                                    </Link>
                                )}
                                {newIdeas > 0 && (
                                    <Link
                                        href="/en/admin/ideas"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <span className="h-2 w-2 bg-yellow-500 rounded-full mr-3"></span>
                                            <span className="text-sm text-gray-700">New Ideas</span>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {newIdeas}
                                        </span>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

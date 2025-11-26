'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Bell } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Notification {
    id: string;
    title: string;
    message: string;
    link: string;
    is_read: boolean;
    created_at: string;
}

/**
 * NotificationBell Component
 * 
 * Displays a bell icon in the navigation bar that shows unread notifications count
 * and allows users to view and mark notifications as read.
 * 
 * Features:
 * - Real-time unread count badge
 * - Dropdown menu with recent notifications (limit 10)
 * - Click notification to mark as read
 * - Polls for new notifications every 60 seconds
 * - Closes dropdown when clicking outside
 * 
 * @component
 * @example
 * ```tsx
 * <NotificationBell />
 * ```
 */
export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    /**
     * Fetches notifications from Supabase for the current user
     * 
     * Retrieves the 10 most recent notifications ordered by creation date.
     * Updates the notifications state and unread count.
     * 
     * @async
     * @function fetchNotifications
     * @returns {Promise<void>}
     */
    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Optional: Set up real-time subscription here if needed
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    /**
     * Marks a notification as read in the database
     * 
     * Uses optimistic UI update to immediately reflect the change before
     * the database operation completes.
     * 
     * @async
     * @function markAsRead
     * @param {string} id - The notification ID to mark as read
     * @returns {Promise<void>}
     */
    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        // Optimistic update
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-muted/20' : ''}`}
                                    >
                                        <div onClick={() => handleNotificationClick(notification)}>
                                            {notification.link ? (
                                                <Link href={notification.link} className="block">
                                                    <p className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </p>
                                                </Link>
                                            ) : (
                                                <div>
                                                    <p className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

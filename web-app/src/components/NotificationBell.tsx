'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { fetchNotifications, markNotificationAsRead } from '@/app/actions/notifications';
import { createBrowserClient } from '@supabase/ssr';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    link?: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        loadNotifications();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${(supabase.auth.getUser() as any).id}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function loadNotifications() {
        const { notifications } = await fetchNotifications();
        if (notifications) {
            setNotifications(notifications);
            setUnreadCount(notifications.filter((n: Notification) => !n.is_read).length);
        }
    }

    async function handleMarkAsRead(id: string) {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
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
                <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-muted/20' : ''}`}
                                    >
                                        <div onClick={() => handleNotificationClick(notification)} className="cursor-pointer">
                                            {notification.link ? (
                                                <Link href={notification.link} className="block">
                                                    <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground mt-2 block">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <div>
                                                    <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground mt-2 block">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </span>
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

'use client';

import Link from 'next/link';
import { LayoutDashboard, CheckSquare, MessageSquare, FileText, LogOut, Code2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

export default function TeamLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const navigation = [
        { name: 'Dashboard', href: `/${locale}/team/dashboard`, icon: LayoutDashboard },
        { name: 'My Tasks', href: `/${locale}/team/tasks`, icon: CheckSquare },
        { name: 'Messages', href: `/${locale}/team/messages`, icon: MessageSquare },
        { name: 'Files', href: `/${locale}/team/files`, icon: FileText },
    ];


    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push(`/${locale}/login`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
                    <Code2 className="h-8 w-8 text-indigo-400" />
                    <div>
                        <h1 className="text-lg font-bold">Winning Code</h1>
                        <p className="text-xs text-gray-400">Dev Team</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
                        >
                            <item.icon className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-400" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center mb-4 px-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                            DV
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Developer</p>
                            <p className="text-xs text-gray-500">Online</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { LayoutDashboard, Folder, MessageSquare, FileText, LogOut, Menu, X, Lightbulb } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: `/${locale}/client/dashboard`, icon: LayoutDashboard },
        { name: 'Projects', href: `/${locale}/client/projects`, icon: Folder },
        { name: 'Messages', href: `/${locale}/client/messages`, icon: MessageSquare },
        { name: 'Files', href: `/${locale}/client/files`, icon: FileText },
        { name: 'Just Ask', href: `/${locale}/submit-idea`, icon: Lightbulb },
    ];


    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push(`/${locale}/login`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-lg font-bold text-indigo-600">Winning Code</h1>
                        <p className="text-xs text-gray-500">Client Portal</p>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6 text-gray-600" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-white">
                    <div className="flex flex-col h-full">
                        {/* Mobile Menu Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h1 className="text-lg font-bold text-indigo-600">Winning Code</h1>
                                <p className="text-xs text-gray-500">Client Portal</p>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="h-6 w-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Mobile Menu Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-4 py-4 text-base font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                                >
                                    <item.icon className="mr-4 h-6 w-6 text-gray-400" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Menu Sign Out */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-indigo-600">Winning Code</h1>
                    <p className="text-xs text-gray-500 mt-1">Client Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors group"
                        >
                            <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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

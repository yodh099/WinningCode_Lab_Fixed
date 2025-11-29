'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Briefcase, LogOut, CreditCard, ShieldCheck, Folder, Lightbulb, Menu, X, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const navigation = [
        { name: 'Dashboard', href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
        { name: 'Clients', href: `/${locale}/admin/clients`, icon: Users },
        { name: 'Projects', href: `/${locale}/admin/projects`, icon: Folder },
        { name: 'Messages', href: `/${locale}/admin/messages`, icon: Mail },
        { name: 'Ideas', href: `/${locale}/admin/ideas`, icon: Lightbulb },
        { name: 'Team', href: `/${locale}/admin/team`, icon: Briefcase },
        { name: 'Invoices', href: `/${locale}/admin/invoices`, icon: CreditCard },
    ];


    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push(`/${locale}/login`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-6 w-6 text-indigo-300" />
                    <span className="font-bold">Admin Console</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md hover:bg-indigo-800"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                bg-indigo-900 text-white w-64 flex-col
                ${isMobileMenuOpen ? 'flex absolute inset-0 z-50' : 'hidden md:flex'}
                md:relative md:flex
            `}>
                <div className="p-6 border-b border-indigo-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ShieldCheck className="h-8 w-8 text-indigo-300" />
                        <div>
                            <h1 className="text-lg font-bold">Winning Code</h1>
                            <p className="text-xs text-indigo-300">Admin Console</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 rounded-md hover:bg-indigo-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm font-medium text-indigo-100 rounded-lg hover:bg-indigo-800 hover:text-white transition-colors group"
                        >
                            <item.icon className="mr-3 h-5 w-5 text-indigo-300 group-hover:text-white" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <div className="flex items-center mb-4 px-4">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-indigo-900">
                            AD
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Administrator</p>
                            <p className="text-xs text-indigo-300">Super User</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
                {children}
            </main>
        </div>
    );
}

import Link from 'next/link';
import { LayoutDashboard, Folder, MessageSquare, FileText, LogOut } from 'lucide-react';

export default async function ClientLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    const navigation = [
        { name: 'Dashboard', href: `/${locale}/client/dashboard`, icon: LayoutDashboard },
        { name: 'Projects', href: `/${locale}/client/projects`, icon: Folder },
        { name: 'Messages', href: `/${locale}/client/messages`, icon: MessageSquare },
        { name: 'Files', href: `/${locale}/client/files`, icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
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
                    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
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

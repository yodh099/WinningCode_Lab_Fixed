import Link from 'next/link';
import { LayoutDashboard, Users, Folder, Briefcase, FileText, LogOut, ShieldCheck, CreditCard } from 'lucide-react';

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    const navigation = [
        { name: 'Dashboard', href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
        { name: 'Clients', href: `/${locale}/admin/clients`, icon: Users },
        { name: 'Projects', href: `/${locale}/admin/projects`, icon: Folder },
        { name: 'Team', href: `/${locale}/admin/team`, icon: Briefcase },
        { name: 'Invoices', href: `/${locale}/admin/invoices`, icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-indigo-800 flex items-center space-x-3">
                    <ShieldCheck className="h-8 w-8 text-indigo-300" />
                    <div>
                        <h1 className="text-lg font-bold">Winning Code</h1>
                        <p className="text-xs text-indigo-300">Admin Console</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
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
                    <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-indigo-800 rounded-lg transition-colors">
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

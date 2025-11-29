import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Folder, MessageSquare, FileText, Calendar, TrendingUp } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    end_date: string | null;
}

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    sender_name?: string;
}

export default async function ClientPage() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single() as { data: { full_name: string; role: string } | null };

    // Fetch client's projects
    const { data: projects } = await supabase
        .from('client_projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3) as { data: Project[] | null };

    // Fetch recent messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(3) as { data: any[] | null };

    const activeProjects = projects?.filter(p => p.status === 'active') || [];
    const totalProjects = projects?.length || 0;

    const formattedMessages = messages?.map(msg => ({
        ...msg,
        sender_name: msg.sender_id === user.id ? 'Me' : 'Project Manager'
    })) || [];

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Mobile-optimized Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {profile?.full_name || 'Client'}</h1>
                    <p className="text-muted-foreground mt-1">Here&apos;s your overview</p>
                </div>

                {/* Stats Grid - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                                <p className="text-2xl md:text-3xl font-bold mt-1">{totalProjects}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500 bg-opacity-10">
                                <Folder className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-2xl md:text-3xl font-bold mt-1">{activeProjects.length}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500 bg-opacity-10">
                                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                                <p className="text-2xl md:text-3xl font-bold mt-1">{formattedMessages.length}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-500 bg-opacity-10">
                                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid - Mobile Optimized */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Active Projects */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-lg font-bold text-foreground">Recent Projects</h3>
                            <Link href="/client/projects" className="text-sm text-primary hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="p-4 md:p-6">
                            {projects && projects.length > 0 ? (
                                <div className="space-y-3">
                                    {projects.slice(0, 3).map((project) => (
                                        <div key={project.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-foreground truncate">{project.name}</h4>
                                                {project.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                    {project.end_date && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(project.end_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No projects yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-lg font-bold text-foreground">Recent Messages</h3>
                            <Link href="/client/messages" className="text-sm text-primary hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="p-4 md:p-6">
                            {formattedMessages.length > 0 ? (
                                <div className="space-y-3">
                                    {formattedMessages.slice(0, 3).map((message) => (
                                        <div key={message.id} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="font-medium text-sm text-foreground">{message.sender_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(message.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No messages yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Mobile Optimized */}
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link href="/client/dashboard" className="bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-center">
                        <Folder className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="text-sm font-medium text-foreground">Dashboard</span>
                    </Link>
                    <Link href="/client/projects" className="bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-center">
                        <Folder className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="text-sm font-medium text-foreground">Projects</span>
                    </Link>
                    <Link href="/client/messages" className="bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-center">
                        <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="text-sm font-medium text-foreground">Messages</span>
                    </Link>
                    <Link href="/client/files" className="bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="text-sm font-medium text-foreground">Files</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

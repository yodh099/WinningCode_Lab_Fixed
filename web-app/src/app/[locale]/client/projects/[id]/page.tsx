import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Clock, DollarSign, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    currency: string;
    client_id: string;
}

export default async function ClientProjectDetails({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch project
    const { data: project, error } = await supabase
        .from('client_projects')
        .select('*')
        .eq('id', params.id)
        .single() as { data: Project | null, error: any };

    if (error || !project) {
        return (
            <div className="p-8 max-w-7xl mx-auto text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
                <p className="text-muted-foreground mb-6">The project you are looking for does not exist or you do not have permission to view it.</p>
                <Link href="/client/dashboard" className="text-primary hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // Security check: Ensure the project belongs to the logged-in client
    if (project.client_id !== user.id) {
        return (
            <div className="p-8 max-w-7xl mx-auto text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-6">You do not have permission to view this project.</p>
                <Link href="/client/dashboard" className="text-primary hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Link href="/client/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 md:p-8 border-b border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Created: {new Date(project.created_at).toLocaleDateString()}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                    }`}>
                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Description
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                {project.description ? (
                                    <p className="whitespace-pre-wrap">{project.description}</p>
                                ) : (
                                    <p className="italic">No description provided.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-muted/30 p-6 rounded-xl border border-border">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Timeline
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</p>
                                    <p className="font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Target Completion</p>
                                    <p className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}</p>
                                </div>
                            </div>
                        </div>

                        {project.budget && (
                            <div className="bg-muted/30 p-6 rounded-xl border border-border">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    Budget
                                </h3>
                                <div>
                                    <p className="text-3xl font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency || 'USD' }).format(project.budget)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

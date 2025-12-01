'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    project_name: string;
    description: string | null;
    status: string;
    progress: number;
    deadline: string | null;
    budget: number | null;
    currency: string;
    client_id: string;
    client_name?: string;
    client_email?: string;
    created_at: string;
    priority: string;
}

export default function ProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            fetchProjectDetails(params.id as string);
        }
    }, [params?.id]);

    async function fetchProjectDetails(id: string) {
        try {
            const supabase = createClient();
            const { data, error } = await (supabase
                .from('client_projects') as any)
                .select(`
                    *,
                    client:profiles!client_id(full_name, email)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setProject({
                    ...data,
                    client_name: data.client?.full_name || 'Unknown Client',
                    client_email: data.client?.email || 'No email'
                });
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'on_hold': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-foreground">Project Not Found</h2>
                <Link href="/admin/projects" className="mt-4 text-primary hover:underline">
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
            </button>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-8 border-b border-border">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-foreground">{project.project_name}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-lg">
                                Client: <span className="text-foreground font-medium">{project.client_name}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Priority</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                ${project.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                    project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'}`}>
                                {project.priority}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {project.description || 'No description provided.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-3">Progress</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-muted rounded-full h-3">
                                    <div
                                        className="bg-primary h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                                <span className="font-bold text-foreground">{project.progress}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 bg-muted/30 p-6 rounded-lg border border-border/50">
                        <div>
                            <div className="flex items-center text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Budget</span>
                            </div>
                            <div className="text-xl font-bold text-foreground pl-6">
                                {project.budget
                                    ? `${project.currency} ${project.budget.toLocaleString()}`
                                    : 'Not set'}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Deadline</span>
                            </div>
                            <div className="text-lg font-medium text-foreground pl-6">
                                {project.deadline
                                    ? new Date(project.deadline).toLocaleDateString(undefined, { dateStyle: 'long' })
                                    : 'No deadline'}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center text-muted-foreground mb-1">
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Created</span>
                            </div>
                            <div className="text-sm text-foreground pl-6">
                                {new Date(project.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

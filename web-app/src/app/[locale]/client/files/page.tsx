'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, AlertCircle, Image as ImageIcon, FileCode, Loader2, File } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProjectFile {
    id: string;
    project_id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    uploaded_by: string;
    uploaded_at: string;
    uploader_name?: string;
}

export default function ClientFiles() {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchFiles();
    }, []);

    async function fetchFiles() {
        try {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // First get user's projects
            const { data: projects } = await supabase
                .from('client_projects')
                .select('id')
                .eq('client_id', user.id);

            if (!projects || projects.length === 0) {
                setLoading(false);
                return;
            }

            const projectIds = projects.map(p => p.id);

            // Fetch files for these projects
            const { data, error } = await supabase
                .from('project_files')
                .select(`
                    *,
                    uploader:uploaded_by(full_name)
                `)
                .in('project_id', projectIds)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const formattedFiles = data?.map(file => ({
                ...file,
                uploader_name: file.uploader?.full_name || 'Unknown'
            })) || [];

            setFiles(formattedFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(file: ProjectFile) {
        try {
            const supabase = createClient();

            // Get signed URL for download
            const { data, error } = await supabase.storage
                .from('project-files')
                .createSignedUrl(file.file_path, 60); // 60 second expiry

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file');
        }
    }

    const getIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return <ImageIcon className="h-6 w-6 text-purple-500" />;
        } else if (fileType.includes('code') || fileType.includes('sql') || fileType.includes('json')) {
            return <FileCode className="h-6 w-6 text-blue-500" />;
        } else if (fileType.includes('pdf') || fileType.includes('document')) {
            return <FileText className="h-6 w-6 text-red-500" />;
        } else {
            return <File className="h-6 w-6 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Files & Documents</h1>
                    <p className="text-muted-foreground mt-2">Access and manage project deliverables and resources.</p>
                </div>
            </div>

            {files.length > 0 ? (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Uploaded</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Uploaded By</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {files.map((file) => (
                                <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                {getIcon(file.file_type)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-foreground">{file.file_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {formatFileSize(file.file_size)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {formatDate(file.uploaded_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {file.uploader_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="text-primary hover:text-primary/80 p-2 hover:bg-primary/10 rounded-full transition-colors"
                                            title="Download file"
                                        >
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No files yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Project files will appear here once they're uploaded</p>
                </div>
            )}
        </div>
    );
}

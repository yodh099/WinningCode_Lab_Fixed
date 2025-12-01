'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Send } from 'lucide-react';
import { submitIdea } from '@/app/actions/ideas';
import { submitInquiry } from '@/app/actions/inquiries';

export default function SubmitIdeaPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('normal');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            setEmail(user.email || '');
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let fileUrl = null;

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = user ? `${user.id}/${fileName}` : `public/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('project-files')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;
                fileUrl = filePath;
            }

            let result;
            if (user) {
                // Authenticated: Submit to ideas table
                result = await submitIdea({
                    title,
                    description,
                    budget,
                    deadline,
                    priority,
                    fileUrl: fileUrl
                });
            } else {
                // Unauthenticated: Submit to inquiries table
                result = await submitInquiry({
                    name: name || 'Guest',
                    email,
                    projectIdea: description,
                    budget,
                    deadline,
                    priority,
                    fileUrl: fileUrl
                });
            }

            if (result.error) {
                throw new Error(result.error);
            }

            setSuccess(true);
            setTitle('');
            setDescription('');
            setBudget('');
            setDeadline('');
            setPriority('normal');
            setFile(null);
            if (!user) {
                setName('');
                setEmail('');
            }

        } catch (err: any) {
            console.error('Error submitting idea:', err);
            const errorMessage = err.message || 'Failed to submit inquiry';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-24 pb-24 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-green-100 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-6">Thank you for sharing your vision. Our team will review it and get back to you shortly.</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Submit Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold font-heading mb-4">Just Ask</h1>
                        <p className="text-xl text-muted-foreground">Tell us about your project. We&apos;ll help you bring it to life.</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {!user && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                                            Your Name *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {user && (
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                                            Project Name *
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g., AI-Powered Analytics Dashboard"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                                        {user ? 'Description *' : 'Project Idea *'}
                                    </label>
                                    <textarea
                                        id="description"
                                        required
                                        rows={6}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                        placeholder="Describe your idea in detail..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-1">
                                            Budget (Optional)
                                        </label>
                                        <input
                                            id="budget"
                                            type="text"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g., $5,000 - $10,000"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-1">
                                            Target Deadline (Optional)
                                        </label>
                                        <input
                                            id="deadline"
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
                                        Priority
                                    </label>
                                    <select
                                        id="priority"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="file" className="block text-sm font-medium text-foreground mb-1">
                                        Attachments (Optional)
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-lg hover:border-primary/50 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <div className="flex text-sm text-muted-foreground">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {file ? file.name : 'PNG, JPG, PDF up to 10MB'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="text-sm text-red-700">{error}</div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Submit Request</span>
                                        <Send className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

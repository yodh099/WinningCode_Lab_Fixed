'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function LoginForm({ locale }: { locale: string }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            // Refresh router to trigger middleware
            router.refresh();
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setLoading(true);
        try {
            const redirectTo = new URL(window.location.origin);
            redirectTo.pathname = `/${locale}/auth/callback`;
            if (next) {
                redirectTo.searchParams.set('next', next);
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectTo.toString(),
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign in</h2>
                <p className="mt-2 text-sm text-muted-foreground">Access your Winning Code dashboard</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email address
                        </label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md border border-border bg-background pl-10 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground">
                            Password
                        </label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md border border-border bg-background pl-10 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                        <div className="flex">
                            <div className="text-sm text-destructive">{error}</div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'Sign in'
                    )}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        className="inline-flex w-full justify-center rounded-md border border-border bg-background py-2.5 px-4 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
                    >
                        <span className="sr-only">Sign in with Google</span>
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        className="inline-flex w-full justify-center rounded-md border border-border bg-background py-2.5 px-4 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
                    >
                        <span className="sr-only">Sign in with Facebook</span>
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}

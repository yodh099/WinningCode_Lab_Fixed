'use client';

import { useTranslations, useLocale } from 'next-intl';
import { blogPosts } from '@/data/blogPosts';
import { BlogPostCard } from '@/components/BlogPostCard';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
    const t = useTranslations('Blog');
    const tSect = useTranslations('Sections');
    const tButtons = useTranslations('Buttons');
    const locale = useLocale();

    return (
        <div className="min-h-screen bg-background">
            {/* Blog Hero */}
            <section className="relative py-32 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
                <div className="container relative z-10 mx-auto px-4">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                        {tSect('blog')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 tracking-tight">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('heroSubtitle')}
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-12 pb-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <BlogPostCard key={post.id} post={post} locale={locale} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-muted/30 border-t border-border">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                        {t('ctaTitle')}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        {t('ctaSubtitle')}
                    </p>
                    <Link
                        href="/client"
                        locale={locale}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-primary/25"
                    >
                        {tButtons('startProject')}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

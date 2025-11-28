import { notFound } from 'next/navigation';

import { getTranslations } from 'next-intl/server';
import { blogPosts } from '@/data/blogPosts';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User, Share2, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} | Winning Code Blog`,
        description: post.subtitle,
        openGraph: {
            title: post.title,
            description: post.subtitle,
            images: [post.image],
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.subtitle,
            images: [post.image],
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug, locale } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // We need to use getTranslations for server components
    const t = await getTranslations({ locale, namespace: 'Blog' });
    const tButtons = await getTranslations({ locale, namespace: 'Buttons' });

    // Find related posts (exclude current one, take up to 2)
    const relatedPosts = blogPosts
        .filter((p) => p.id !== post.id)
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover brightness-50"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="container mx-auto">
                        <Link
                            href="/blog"
                            locale={locale}
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">{t('backToBlog')}</span>
                        </Link>

                        <div className="flex items-center gap-4 text-white/90 mb-4 text-sm md:text-base">
                            <span className="bg-primary px-3 py-1 rounded-full font-bold text-white text-xs uppercase tracking-wider">
                                {post.category}
                            </span>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{post.readTime}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-heading mb-4 leading-tight max-w-4xl">
                            {post.title}
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl font-light">
                            {post.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <article className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <div className="flex items-center justify-between mb-12 pb-8 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <User size={24} className="text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">{post.author}</p>
                            <p className="text-sm text-muted-foreground">{t('authorRole')}</p>
                        </div>
                    </div>
                    <button className="p-3 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Share">
                        <Share2 size={20} />
                    </button>
                </div>

                <div
                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="bg-muted/30 py-16 border-t border-border mt-12">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold font-heading mb-8 text-center">{t('relatedPosts')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {relatedPosts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    locale={locale}
                                    className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                                >
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image
                                            src={related.image}
                                            alt={related.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="text-xs font-bold text-primary mb-2">{related.category}</div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{related.title}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2">{related.subtitle}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="container mx-auto px-4 py-16 text-center">
                <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold font-heading mb-4">{t('ctaTitle')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
                        {t('ctaSubtitle')}
                    </p>
                    <Link
                        href="/client"
                        locale={locale}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
                    >
                        {tButtons('startProject')}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

'use client';

import { Link } from '@/i18n/routing';
import { BlogPost } from '@/data/blogPosts';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';

interface BlogPostCardProps {
    post: BlogPost;
    locale: string;
}

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
    const t = useTranslations('Blog');

    return (
        <article className="group flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    {post.category}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-6">
                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{post.readTime}</span>
                    </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
                    {post.subtitle}
                </p>

                {/* Author & Action */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <User size={16} className="text-primary" />
                        <span className="font-medium">{post.author}</span>
                    </div>

                    <Link
                        href={`/blog/${post.slug}`}
                        locale={locale}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        {t('readMore')} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

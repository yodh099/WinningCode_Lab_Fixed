'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const t = useTranslations(`Services`);
    const tBtn = useTranslations('Buttons');

    // Map slug to translation key
    const serviceKeyMap: Record<string, string> = {
        'web-development': 'web',
        'mobile-apps': 'mobile',
        'ai-automation': 'ai',
        'branding': 'brand',
        'digital-solutions': 'digital',
        'workflow-systems': 'workflow'
    };
    const serviceKey = serviceKeyMap[slug];

    if (!serviceKey) {
        notFound();
    }

    // Since we can't dynamically check if a key exists easily in next-intl without try/catch or knowing keys,
    // we assume the mapping is correct. If the slug is invalid, it won't be in the map.

    const serviceImages: Record<string, string> = {
        web: '/images/services/web-development.png',
        mobile: '/images/services/mobile-apps.png',
        ai: '/images/services/ai-automation.png',
        brand: '/images/services/branding.png',
        digital: '/images/services/digital-solutions.png',
        workflow: '/images/services/workflow-systems.png',
    };

    // Helper to get array from translations
    // We need to cast to any because next-intl types are strict and don't always know about arrays
    // In a real app we might use a richer type safe method or getMessages
    const getList = (key: string) => {
        try {
            // @ts-ignore
            return t.raw(`${serviceKey}.${key}.list`) as string[];
        } catch (e) {
            return [];
        }
    };

    const getSteps = (key: string) => {
        try {
            // @ts-ignore
            return t.raw(`${serviceKey}.${key}.steps`) as string[];
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={serviceImages[serviceKey]}
                        alt={t(`${serviceKey}.title`)}
                        fill
                        className="object-cover opacity-30 animate-pulse-slow"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,background_100%)]" />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent animate-gradient tracking-tight">
                        {t(`${serviceKey}.title`)}
                    </h1>
                    <p className="text-xl md:text-3xl text-foreground/80 font-light max-w-3xl mx-auto leading-relaxed">
                        {t(`${serviceKey}.heroSubtitle`)}
                    </p>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-invert prose-lg max-w-none mb-20">
                            <h2 className="text-3xl font-bold mb-8 text-primary border-l-4 border-primary pl-4">Overview</h2>
                            <p className="text-lg text-muted-foreground leading-loose text-justify">
                                {t(`${serviceKey}.overview`)}
                            </p>
                        </div>

                        {/* Tech Stack & Features Grid */}
                        <div className="grid md:grid-cols-2 gap-16 mb-20">
                            <div>
                                <h3 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-3">
                                    <span className="w-8 h-1 bg-primary rounded-full"></span>
                                    {t(`${serviceKey}.techStack.title`)}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {getList('techStack').map((tech, index) => (
                                        <span key={index} className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-3">
                                    <span className="w-8 h-1 bg-primary rounded-full"></span>
                                    {t(`${serviceKey}.features.title`)}
                                </h3>
                                <ul className="space-y-4">
                                    {getList('features').map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                            <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Use Cases */}
                        <div className="mb-20">
                            <h3 className="text-2xl font-bold mb-10 text-foreground text-center">
                                {t(`${serviceKey}.useCases.title`)}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {getList('useCases').map((useCase, index) => (
                                    <div key={index} className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-all hover:shadow-lg group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <span className="font-bold">{index + 1}</span>
                                            </div>
                                            <p className="text-lg text-muted-foreground pt-1">{useCase}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Process */}
                        <div className="mb-20">
                            <h3 className="text-2xl font-bold mb-12 text-foreground text-center">
                                {t(`${serviceKey}.process.title`)}
                            </h3>
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20 md:left-1/2 md:-ml-px"></div>

                                <div className="space-y-12">
                                    {getSteps('process').map((step, index) => (
                                        <div key={index} className={`relative flex items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                            {/* Dot */}
                                            <div className="absolute left-0 md:left-1/2 w-10 h-10 -ml-5 rounded-full border-4 border-background bg-primary flex items-center justify-center z-10 shadow-lg shadow-primary/30">
                                                <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="ml-16 md:ml-0 md:w-[45%] bg-card/50 backdrop-blur-sm border border-border p-6 rounded-xl hover:border-primary/50 transition-all">
                                                <h4 className="text-xl font-semibold text-foreground">{step}</h4>
                                            </div>

                                            {/* Spacer for alternating layout */}
                                            <div className="hidden md:block md:w-[45%]"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="text-center py-16 border-t border-border/20">
                            <h3 className="text-3xl md:text-4xl font-bold mb-8">Ready to transform your business?</h3>
                            <Link
                                href="/ask"
                                className="inline-block px-12 py-5 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl shadow-primary/25 hover:shadow-primary/40"
                            >
                                {tBtn('startProject')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

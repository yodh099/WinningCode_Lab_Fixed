'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Home Page Component
 * 
 * The main landing page displaying all key sections:
 * - Hero with animated background
 * - Upcoming Projects
 * - Services Grid
 * - Value Propositions
 * - About Preview
 * - Blog Preview
 * - Call to Action
 */
export default function HomePage() {
    const t = useTranslations();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.05),transparent_50%)]" />

                <div className="container mx-auto px-4 md:px-6 relative z-10 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent animate-pulse tracking-tight leading-tight">
                            {t('HomePage.title')}
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                            {t('HomePage.description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/projects"
                                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
                            >
                                {t('Buttons.explore')}
                            </Link>
                            <Link
                                href="/ask"
                                className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all transform hover:scale-105 border border-border"
                            >
                                {t('Buttons.ask')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-20 md:py-32 bg-muted/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
                            {t('Sections.projects')}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((item) => (
                                <article
                                    key={item}
                                    className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all transform hover:-translate-y-1 hover:shadow-xl shadow-lg shadow-black/5"
                                >
                                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                                            <div className="w-8 h-8 rounded-full bg-primary/40" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-center text-foreground">
                                            {t('Common.comingSoon')}
                                        </h3>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
                            {t('Sections.services')}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {['web-development', 'mobile-apps', 'ai-automation', 'branding', 'digital-solutions', 'workflow-systems'].map((serviceSlug) => {
                                // Map slug back to translation key (simplified for now, ideally keys match slugs)
                                const serviceKeyMap: Record<string, string> = {
                                    'web-development': 'web',
                                    'mobile-apps': 'mobile',
                                    'ai-automation': 'ai',
                                    'branding': 'brand',
                                    'digital-solutions': 'digital',
                                    'workflow-systems': 'workflow'
                                };
                                const service = serviceKeyMap[serviceSlug];

                                const serviceImages: Record<string, string> = {
                                    web: '/images/services/web-development.png',
                                    mobile: '/images/services/mobile-apps.png',
                                    ai: '/images/services/ai-automation.png',
                                    brand: '/images/services/branding.png',
                                    digital: '/images/services/digital-solutions.png',
                                    workflow: '/images/services/workflow-systems.png',
                                };

                                return (
                                    <Link
                                        key={serviceSlug}
                                        href={`/services/${serviceSlug}`}
                                        className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all transform hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden"
                                    >
                                        <div className="w-full aspect-square relative mb-6 rounded-lg overflow-hidden bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                            <Image
                                                src={serviceImages[service]}
                                                alt={t(`Services.${service}.title`)}
                                                fill
                                                className="object-cover animate-float transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors relative z-10">
                                            {t(`Services.${service}.title`)}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                                            {t(`Services.${service}.description`)}
                                            {' '}
                                            <span className="text-primary font-medium hover:underline">
                                                [[{t('Buttons.readMore')}]]
                                            </span>
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="py-20 md:py-32 bg-muted/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {['accessible', 'fast', 'ai', 'human'].map((value) => (
                            <div
                                key={value}
                                className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all hover:shadow-lg"
                            >
                                <h3 className="text-xl font-semibold mb-4 text-foreground">
                                    {t(`ValueProp.${value}.title`)}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {t(`ValueProp.${value}.description`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Preview Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div className="relative order-2 md:order-1">
                                <div className="w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full border-4 border-primary/20 relative">
                                    <div className="absolute inset-4 rounded-full border-2 border-primary/20 animate-spin-slow" />
                                    <div className="absolute inset-8 rounded-full border border-primary/10" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl font-bold text-primary/20">WC</span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 md:order-2 text-center md:text-left">
                                <h2 className="text-3xl md:text-5xl font-bold mb-8 text-foreground">
                                    {t('Sections.mission')}
                                </h2>
                                <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                                    {t('About.mission.content')}
                                </p>
                                <p className="text-muted-foreground mb-10 leading-relaxed text-lg">
                                    {t('About.vision.content')}
                                </p>
                                <Link
                                    href="/about"
                                    className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all inline-block"
                                >
                                    {t('Buttons.learnMore')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Preview Section */}
            <section className="py-20 md:py-32 bg-muted/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
                            {t('Sections.blog')}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {['post1', 'post2', 'post3'].map((post) => (
                                <article
                                    key={post}
                                    className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all transform hover:-translate-y-1 hover:shadow-lg flex flex-col"
                                >
                                    <h3 className="text-xl font-semibold mb-4 text-foreground">
                                        {t(`Blog.${post}.title`)}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
                                        {t(`Blog.${post}.description`)}
                                    </p>
                                    <Link
                                        href="/blog"
                                        className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors flex items-center gap-2 mt-auto"
                                    >
                                        {t('Buttons.readMore')} <span>→</span>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 text-foreground">
                            {t('CTA.title')}
                        </h2>
                        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                            {t('CTA.description')}
                        </p>
                        <Link
                            href="/ask"
                            className="px-10 py-5 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all transform hover:scale-105 inline-block shadow-lg shadow-primary/20"
                        >
                            {t('Buttons.start')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

'use client';

import { useTranslations } from 'next-intl';


export default function ProjectsPage() {
    const t = useTranslations('Sections');
    const tCommon = useTranslations('Common');

    // Placeholder projects as per original HTML
    const projects = Array(6).fill(null);

    return (
        <>
            {/* Page Header */}
            <div className="py-32 text-center bg-gradient-to-b from-background/80 to-background">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading">{t('projects')}</h1>
                </div>
            </div>

            {/* Projects Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((_, index) => (
                            <article
                                key={index}
                                className="group relative aspect-[4/3] bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <h3 className="text-xl font-heading uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                                        {tCommon('comingSoon')}
                                    </h3>
                                    <div className="mt-4 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--color-primary)]"></div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

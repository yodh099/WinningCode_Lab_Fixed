'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function ServicesPage() {
    const t = useTranslations('Services');
    const tBtn = useTranslations('Buttons');
    const tSect = useTranslations('Sections');

    const services = [
        {
            id: 'web',
            slug: 'web-development',
            image: '/images/services/web-development.png',
        },
        {
            id: 'mobile',
            slug: 'mobile-apps',
            image: '/images/services/mobile-apps.png',
        },
        {
            id: 'ai',
            slug: 'ai-automation',
            image: '/images/services/ai-automation.png',
        },
        {
            id: 'brand',
            slug: 'branding',
            image: '/images/services/branding.png',
        },
        {
            id: 'digital',
            slug: 'digital-solutions',
            image: '/images/services/digital-solutions.png',
        },
        {
            id: 'workflow',
            slug: 'workflow-systems',
            image: '/images/services/workflow-systems.png',
        },
    ];

    return (
        <>
            {/* Page Header */}
            <div className="py-32 text-center bg-gradient-to-b from-background/80 to-background">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading">{tSect('services')}</h1>
                </div>
            </div>

            {/* Services Sections */}
            {services.map((service, index) => (
                <section key={service.id} id={`${service.id}-dev`} className="py-24 border-b border-border/10 last:border-0">
                    <div className="container mx-auto px-4">
                        <div className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="flex-1 space-y-6">
                                <Link href={`/services/${service.slug}`} className="group block">
                                    <h2 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                                        {t(`${service.id}.title`)}
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        {t(`${service.id}.description`)}
                                        {' '}
                                        <span className="text-primary font-medium hover:underline inline-block ml-1">
                                            [[{tBtn('readMore')}]]
                                        </span>
                                    </p>
                                </Link>
                                <div className="flex gap-4 items-center">
                                    <Link
                                        href="/ask"
                                        className="inline-block px-6 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-background transition-all shadow-[0_0_10px_rgba(56,189,248,0.1)] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-0.5"
                                    >
                                        {tBtn('startProject')}
                                    </Link>
                                </div>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="w-full aspect-square md:h-96 bg-accent/5 rounded-2xl border border-accent/20 relative overflow-hidden group shadow-2xl shadow-black/20">
                                    <Image
                                        src={service.image}
                                        alt={t(`${service.id}.title`)}
                                        fill
                                        className="object-cover animate-float transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* CTA Section */}
            <section className="py-32 text-center bg-gradient-to-br from-background to-[#0f2a4a]">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading">Got an idea? Just Ask.</h2>
                        <p className="text-xl text-muted-foreground">Submit your project idea and budget, we’ll make it happen.</p>
                        <Link
                            href="/ask"
                            className="inline-block px-8 py-4 text-lg rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-background transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] hover:-translate-y-1"
                        >
                            {tBtn('start')}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

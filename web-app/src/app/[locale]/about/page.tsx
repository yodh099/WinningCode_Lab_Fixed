'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Lightbulb, Users, Target, Zap, Heart, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
    const t = useTranslations('About');

    const values = ['innovation', 'accessibility', 'transparency', 'creativity', 'humanCentered', 'empowerment'];
    const steps = ['discovery', 'strategy', 'design', 'build', 'optimize'];
    const differentiators = ['dualModel', 'aiFirst', 'simplicityFocus'];
    const team = ['founder', 'creative', 'engineering', 'ai', 'product'];
    const impact = ['entrepreneurs', 'smallBusiness', 'education'];

    const valueIcons: Record<string, any> = {
        innovation: Lightbulb,
        accessibility: Users,
        transparency: Target,
        creativity: Zap,
        humanCentered: Heart,
        empowerment: TrendingUp
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        {t('heroSubtitle')}
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 bg-card/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                                {t('story.subtitle')}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{t('story.title')}</h2>
                        </div>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left">
                                {t('story.paragraph1')}
                            </p>
                            <p>{t('story.paragraph2')}</p>
                            <p className="text-foreground font-medium">{t('story.paragraph3')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all duration-500">
                            <div className="w-16 h-16 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Target size={32} className="text-primary" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 text-primary">{t('mission.title')}</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">{t('mission.content')}</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10 hover:border-accent/30 transition-all duration-500">
                            <div className="w-16 h-16 mb-6 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                                <Zap size={32} className="text-accent" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 text-accent">{t('vision.title')}</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">{t('vision.content')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{t('values.title')}</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('values.subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {values.map((value) => {
                            const Icon = valueIcons[value];
                            return (
                                <div key={value} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                                    <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Icon size={24} className="text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{t(`values.${value}.title`)}</h3>
                                    <p className="text-muted-foreground">{t(`values.${value}.description`)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Our Approach */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{t('approach.title')}</h2>
                        <p className="text-xl text-muted-foreground">{t('approach.subtitle')}</p>
                        <p className="text-muted-foreground mt-4">{t('approach.description')}</p>
                    </div>
                    <div className="max-w-5xl mx-auto">
                        <div className="relative">
                            {/* Connection line */}
                            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {steps.map((step, index) => (
                                    <div key={step} className="relative">
                                        <div className="p-6 rounded-2xl bg-card border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 group">
                                            <div className="w-10 h-10 mb-4 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary text-primary font-bold">
                                                {index + 1}
                                            </div>
                                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{t(`approach.steps.${step}.title`)}</h3>
                                            <p className="text-sm text-muted-foreground">{t(`approach.steps.${step}.description`)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Makes Us Different */}
            <section className="py-24 bg-card/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{t('differentiators.title')}</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('differentiators.subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {differentiators.map((diff) => (
                            <div key={diff} className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 hover:shadow-2xl transition-all duration-500">
                                <h3 className="text-xl md:text-2xl font-bold mb-4">{t(`differentiators.${diff}.title`)}</h3>
                                <p className="text-muted-foreground leading-relaxed">{t(`differentiators.${diff}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{t('team.title')}</h2>
                        <p className="text-xl text-muted-foreground">{t('team.subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {team.map((member) => (
                            <div key={member} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 group">
                                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    <Users size={32} className="text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{t(`team.${member}.name`)}</h3>
                                <p className="text-primary font-medium mb-3">{t(`team.${member}.role`)}</p>
                                <p className="text-sm text-muted-foreground">{t(`team.${member}.bio`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact & Community */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{t('impact.title')}</h2>
                            <p className="text-xl text-muted-foreground">{t('impact.subtitle')}</p>
                        </div>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-12">
                            <p>{t('impact.paragraph1')}</p>
                            <p>{t('impact.paragraph2')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {impact.map((item) => (
                            <div key={item} className="p-6 rounded-2xl bg-card border border-border">
                                <CheckCircle2 size={32} className="text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-3">{t(`impact.${item}.title`)}</h3>
                                <p className="text-muted-foreground">{t(`impact.${item}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ecosystem */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{t('ecosystem.title')}</h2>
                        <p className="text-xl text-muted-foreground mb-8">{t('ecosystem.subtitle')}</p>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-8">
                            <p>{t('ecosystem.paragraph1')}</p>
                            <p>{t('ecosystem.paragraph2')}</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 inline-block">
                            <p className="text-xl md:text-2xl font-medium text-foreground italic">
                                "{t('ecosystem.vision')}"
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">{t('cta.title')}</h2>
                        <p className="text-xl text-muted-foreground mb-10">{t('cta.subtitle')}</p>
                        <Link
                            href="/client"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-2xl hover:shadow-primary/25"
                        >
                            {t('cta.button')}
                            <ArrowRight size={24} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

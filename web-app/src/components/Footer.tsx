'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Mail, Globe } from 'lucide-react';
import {
    FaLinkedin,
    FaGithub,
    FaFacebook,
    FaYoutube,
    FaInstagram,
    FaXTwitter,
    FaTiktok,
    FaTelegram,
    FaDiscord
} from 'react-icons/fa6';
import { useState } from 'react';

/**
 * Footer Component
 * 
 * Comprehensive footer for Winning Code Lab platform with:
 * - 4-column responsive layout
 * - Branding and 9 social media platforms (with wrapping layout)
 * - Public navigation
 * - Client ecosystem section
 * - Contact and legal information
 * - Language switcher
 * - Dark/Light mode compatible
 */
export function Footer() {
    const t = useTranslations('Footer');
    const locale = useLocale();
    const [isLangOpen, setIsLangOpen] = useState(false);

    const currentYear = new Date().getFullYear();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ht', name: 'Kreyòl', flag: '🇭🇹' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];

    // 9 Social Media Platforms with FontAwesome 6 Icons
    const socialLinks = [
        { icon: FaLinkedin, href: 'https://www.linkedin.com/in/winning-code-lab-85855a393/', label: 'LinkedIn', color: 'hover:text-[#0A66C2]' },
        { icon: FaGithub, href: 'https://github.com/winningcode3-agent', label: 'GitHub', color: 'hover:text-foreground' },
        { icon: FaFacebook, href: 'https://www.facebook.com/profile.php?id=61582565047368', label: 'Facebook', color: 'hover:text-[#1877F2]' },
        { icon: FaYoutube, href: 'https://www.youtube.com/channel/UCJofsNCKRQRnToLf2tPqq4w/posts', label: 'YouTube', color: 'hover:text-[#FF0000]' },
        { icon: FaInstagram, href: 'https://www.instagram.com/winningcode3/', label: 'Instagram', color: 'hover:text-[#E4405F]' },
        { icon: FaXTwitter, href: 'https://x.com/winningcode_Lab', label: 'Twitter / X', color: 'hover:text-foreground' },
        { icon: FaTiktok, href: 'https://www.tiktok.com/@winningcode_3', label: 'TikTok', color: 'hover:text-foreground' },
        { icon: FaTelegram, href: 'https://t.me/+XzIgE9MQIptjOTRh', label: 'Telegram', color: 'hover:text-[#26A5E4]' },
        { icon: FaDiscord, href: 'https://discord.com/channels/1430702583387000913/1430702584678580276', label: 'Discord', color: 'hover:text-[#5865F2]' },
    ];


    return (
        <footer className="bg-card border-t border-border">
            <div className="container mx-auto px-4 py-12 md:py-16">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">

                    {/* Column 1: Branding & Social Hub */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-heading font-bold mb-2">Winning Code Lab</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                Building Digital Ecosystems
                            </p>
                        </div>

                        {/* Social Media Links - Wrapping Layout for 9 Icons */}
                        <div className="flex flex-wrap gap-3 pt-2 max-w-[280px]">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 group ${social.color}`}
                                    aria-label={social.label}
                                    title={social.label}
                                >
                                    <social.icon size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Explore (Public Pages) */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t('explore.title')}</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/projects"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                                >
                                    {t('explore.projects')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                                >
                                    {t('explore.services')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                                >
                                    {t('explore.blog')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Client Ecosystem */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t('clients.title')}</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/client"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                                >
                                    {t('clients.login')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/client/projects"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                                >
                                    {t('clients.status')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/ask"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                                >
                                    {t('clients.support')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Legal */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t('contact.title')}</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Globe size={16} className="mt-1 flex-shrink-0" />
                                <span>{t('contact.location')}</span>
                            </li>
                            <li>
                                <Link
                                    href="/ask"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Mail size={16} />
                                    <span>Just Ask</span>
                                </Link>
                            </li>
                        </ul>

                        {/* Legal Links */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors inline-block"
                                    >
                                        {t('legal.privacy')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/terms"
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors inline-block"
                                    >
                                        {t('legal.terms')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Copyright */}
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © {currentYear} {t('copyright')}
                    </p>

                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                            aria-label="Select Language"
                        >
                            <Globe size={16} />
                            <span>{languages.find(l => l.code === locale)?.name || 'English'}</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Language Dropdown */}
                        {isLangOpen && (
                            <div className="absolute bottom-full mb-2 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[160px] z-50">
                                {languages.map((lang) => (
                                    <Link
                                        key={lang.code}
                                        href="/"
                                        locale={lang.code as 'en' | 'fr' | 'ht' | 'es'}
                                        onClick={() => setIsLangOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${locale === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                            }`}
                                    >
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="text-sm">{lang.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}

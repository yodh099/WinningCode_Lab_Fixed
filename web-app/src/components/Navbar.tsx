'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

/**
 * Navigation item type definition
 */
interface NavItem {
    href: string;
    label: string;
}

/**
 * Language option type definition
 */
interface LanguageOption {
    code: string;
    label: string;
}

/**
 * Props for the Navbar component
 */
interface NavbarProps {
    /** Current active locale code (e.g., 'en', 'fr', 'ht', 'es') */
    locale: string;
}

/**
 * Navigation Bar Component
 * 
 * Displays the main navigation menu with:
 * - Brand logo/name linking to home
 * - Navigation links to main pages
 * - Language switcher for i18n support
 * 
 * The component is responsive and includes accessibility features like
 * aria-labels and proper semantic HTML.
 * 
 * @param locale - The current active locale
 */
export function Navbar({ locale }: NavbarProps) {
    const t = useTranslations('Navigation');
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Main navigation items
    const navItems: NavItem[] = [
        { href: '/', label: t('home') },
        { href: '/services', label: t('services') },
        { href: '/projects', label: t('projects') },
        { href: '/blog', label: t('blog') },
        { href: '/about', label: t('about') },
        { href: '/client', label: t('client') },
        { href: '/ask', label: t('ask') },
    ];

    // Available language options
    const languages: LanguageOption[] = [
        { code: 'en', label: 'EN' },
        { code: 'fr', label: 'FR' },
        { code: 'ht', label: 'HT' },
        { code: 'es', label: 'ES' },
    ];

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 md:px-6">
                <nav className="flex justify-between items-center h-16" aria-label="Main navigation">
                    {/* Brand Logo */}
                    <Link
                        href="/"
                        locale={locale}
                        className="text-2xl font-bold text-foreground tracking-tight hover:text-primary transition-colors"
                        aria-label="Winning Code home"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className="font-heading">Winning Code</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <ul className="hidden lg:flex gap-8 items-center">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    locale={locale}
                                    className={`text-sm font-medium transition-colors ${pathname === item.href
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-primary'
                                        }`}
                                    aria-current={pathname === item.href ? 'page' : undefined}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop Language Switcher */}
                    <div className="hidden lg:flex gap-2 border-l border-border pl-4" role="group" aria-label="Language selection">
                        {languages.map((lang) => (
                            <Link
                                key={lang.code}
                                href={pathname}
                                locale={lang.code}
                                className={`px-2 py-1 text-xs font-semibold rounded transition-all ${locale === lang.code
                                    ? 'text-primary bg-primary/10 border border-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                aria-label={`Switch to ${lang.label}`}
                                aria-current={locale === lang.code ? 'true' : undefined}
                            >
                                {lang.label}
                            </Link>
                        ))}
                    </div>

                    {/* Notification Bell */}
                    <div className="hidden lg:flex items-center ml-4 border-l border-border pl-4">
                        <NotificationBell />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </nav>
            </div>

            {/* Mobile Menu - Premium Animated */}
            {isMobileMenuOpen && (
                <>
                    {/* Animated Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Slide-in Menu Panel */}
                    <div
                        className="lg:hidden fixed inset-y-0 right-0 w-[85%] max-w-md z-50 shadow-2xl"
                        style={{
                            backgroundColor: '#0B1120',
                            opacity: 1,
                            background: '#0B1120',
                            backgroundImage: 'none',
                            animation: 'slideInRight 0.3s ease-out'
                        }}
                    >
                        {/* Header with Logo and Close */}
                        <div
                            className="flex items-center justify-between px-6 py-5 border-b border-slate-700"
                            style={{ backgroundColor: '#1E293B' }}
                        >
                            <span className="text-xl font-bold font-heading text-foreground">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={24} className="text-foreground" />
                            </button>
                        </div>

                        {/* Mobile Notification Bell */}
                        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Notifications</span>
                            <NotificationBell />
                        </div>

                        {/* Scrollable Menu Content */}
                        <div className="h-[calc(100vh-73px)] overflow-y-auto">
                            {/* Navigation Links */}
                            <nav className="p-6 space-y-1">
                                {navItems.map((item, index) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        locale={locale}
                                        className={`
                                            group relative flex items-center gap-3 px-4 py-4 rounded-xl font-medium text-lg
                                            transition-all duration-200 overflow-hidden
                                            ${pathname === item.href
                                                ? 'bg-primary/10 text-primary shadow-sm'
                                                : 'text-foreground hover:bg-muted/60 hover:text-primary'
                                            }
                                        `}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                            animation: 'slideInFromRight 0.3s ease-out forwards'
                                        }}
                                    >
                                        {/* Active indicator */}
                                        {pathname === item.href && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                        )}

                                        {/* Icon placeholder */}
                                        <div className={`w-2 h-2 rounded-full transition-all ${pathname === item.href ? 'bg-primary scale-100' : 'bg-muted-foreground/30 scale-75 group-hover:scale-100 group-hover:bg-primary'
                                            }`} />

                                        <span className="flex-1">{item.label}</span>

                                        {/* Arrow indicator */}
                                        <svg
                                            className={`w-5 h-5 transition-transform ${pathname === item.href ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))}
                            </nav>

                            {/* Language Selector */}
                            <div className="px-6 py-6 border-t border-border/20 bg-[#1E293B]/30">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                    Choose Language
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {languages.map((lang) => (
                                        <Link
                                            key={lang.code}
                                            href={pathname}
                                            locale={lang.code}
                                            className={`
                                                relative px-4 py-3 rounded-lg font-bold text-center
                                                border-2 transition-all duration-200
                                                ${locale === lang.code
                                                    ? 'border-primary bg-primary/10 text-primary shadow-md scale-105'
                                                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-muted/50'
                                                }
                                            `}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {locale === lang.code && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {lang.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}

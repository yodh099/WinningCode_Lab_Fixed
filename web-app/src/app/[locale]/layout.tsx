import type { Metadata } from "next";
import { Space_Grotesk, Inter_Tight } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Navbar } from '@/components/Navbar';
import { FooterWrapper } from '@/components/FooterWrapper';
import { routing } from '@/i18n/routing';
import "../globals.css";

/**
 * Font configurations using Google Fonts
 */
const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    display: "swap",
});

const interTight = Inter_Tight({
    variable: "--font-inter-tight",
    subsets: ["latin"],
    display: "swap",
});

/**
 * Default metadata for the application
 * Note: This can be extended with generateMetadata for dynamic, locale-specific metadata
 */
export const metadata: Metadata = {
    title: "Winning Code Lab",
    description: "The future of web development.",
};

/**
 * Generate static params for all supported locales
 * This enables static generation for all locale routes at build time
 */
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

/**
 * Props type for RootLayout component
 */
interface RootLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

/**
 * Root Layout Component
 * 
 * This layout wraps all pages in the application and provides:
 * - Font configuration
 * - Internationalization context via NextIntlClientProvider
 * - Common UI elements (Navbar, Footer)
 * - Global styles
 * 
 * @param children - Child components/pages to render
 * @param params - Route parameters containing the locale
 */
export default async function RootLayout({
    children,
    params
}: Readonly<RootLayoutProps>) {
    // Await the params to get the locale
    const { locale } = await params;

    // Fetch translation messages for the current locale
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${spaceGrotesk.variable} ${interTight.variable} antialiased bg-background text-foreground`}
            >
                <NextIntlClientProvider messages={messages}>
                    <Navbar locale={locale} />
                    <main className="pt-20">{children}</main>
                    <FooterWrapper />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

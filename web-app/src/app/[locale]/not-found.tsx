'use client';

import { useTranslations } from 'next-intl';

/**
 * Not Found Page Component
 * 
 * Custom 404 error page shown when users navigate to non-existent routes
 * within a locale. Displays a localized error message.
 * 
 * Note: This must be a client component because it uses the useTranslations hook.
 */
export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">{t('title')}</h2>
            <p className="text-xl text-muted-foreground">{t('description')}</p>
        </div>
    );
}

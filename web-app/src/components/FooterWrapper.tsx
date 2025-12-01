'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
    const pathname = usePathname();
    const isDashboard = pathname?.includes('/admin') || pathname?.includes('/client') || pathname?.includes('/staff');

    if (isDashboard) return null;

    return <Footer />;
}

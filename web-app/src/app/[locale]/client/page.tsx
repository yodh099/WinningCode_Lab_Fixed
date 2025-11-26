import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function ClientPage() {
    const t = useTranslations('ClientSpace');

    return (
        <div className="min-h-screen bg-background pt-8 pb-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                    {/* Sidebar */}
                    <aside className="bg-card border border-border rounded-xl p-6 h-fit">
                        <nav>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/client" className="block px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium">
                                        {t('title')}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/client" className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                        {t('projects')}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/client" className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                        {t('messages')}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/client" className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                        {t('files')}
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Welcome Card */}
                        <div className="bg-card border border-border rounded-xl p-6 col-span-full">
                            <h3 className="text-xl font-bold font-heading mb-2">{t('welcome')}</h3>
                            <p className="text-muted-foreground">Client Name</p>
                        </div>

                        {/* Active Projects */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">{t('projects')}</h3>
                            <p className="text-muted-foreground">No active projects.</p>
                        </div>

                        {/* Messages */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">{t('messages')}</h3>
                            <p className="text-muted-foreground">No new messages.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

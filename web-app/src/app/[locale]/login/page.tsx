import LoginForm from '@/components/LoginForm';

export default async function LoginPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
            <LoginForm locale={locale} />
        </div>
    );
}

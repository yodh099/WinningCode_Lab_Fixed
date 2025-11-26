import RegisterForm from '@/components/RegisterForm';

export default async function RegisterPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
            <RegisterForm locale={locale} />
        </div>
    );
}

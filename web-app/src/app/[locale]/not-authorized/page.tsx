import { useTranslations } from 'next-intl';

export default function NotAuthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8 text-red-500">403 - Not Authorized</h1>
            <p className="mb-4">You do not have permission to access this page.</p>
        </div>
    );
}

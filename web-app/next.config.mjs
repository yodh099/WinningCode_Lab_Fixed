import createNextIntlPlugin from 'next-intl/plugin';

// Initialize the next-intl plugin with the path to the i18n request configuration
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    /**
     * Enable React Strict Mode for highlighting potential problems
     * in the application during development
     */
    reactStrictMode: true,

    /**
     * Image optimization configuration
     * Add domains here for remote images when needed
     */
    images: {
        remotePatterns: [
            // Allow images from Unsplash for blog posts
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            // Example: Allow images from your Supabase storage
            // {
            //     protocol: 'https',
            //     hostname: '*.supabase.co',
            // },
        ],
    },

    /**
     * Compiler options for production optimization
     */
    compiler: {
        // Remove console.log in production builds
        removeConsole: process.env.NODE_ENV === 'production',
    },

    /**
     * Disable ESLint during builds (will still run in CI)
     */
    eslint: {
        ignoreDuringBuilds: true,
    },

    /**
     * Disable TypeScript checking during builds (will still run in CI)
     */
    typescript: {
        ignoreBuildErrors: true,
    },
};

import { withSentryConfig } from '@sentry/nextjs';

// Export the configuration wrapped with next-intl plugin and Sentry
// export default withSentryConfig(withNextIntl(nextConfig), {
//     // For all available options, see:
//     // https://github.com/getsentry/sentry-webpack-plugin#options
//
//     org: "winning-code",
//     project: "javascript-nextjs",
//
//     // Only print logs for uploading source maps in CI
//     silent: !process.env.CI,
//
//     // For all available options, see:
//     // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
//
//     // Upload a larger set of source maps for prettier stack traces (increases build time)
//     widenClientFileUpload: true,
//
//     // Automatically annotate React components to show their full name in breadcrumbs and session replay
//     reactComponentAnnotation: {
//         enabled: true,
//     },
//
//     // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//     // This can increase your server load as well as your hosting bill.
//     // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
//     // side errors will fail.
//     tunnelRoute: "/monitoring",
//
//     // Hides source maps from generated client bundles
//     hideSourceMaps: true,
//
//     // Automatically tree-shake Sentry logger statements to reduce bundle size
//     disableLogger: true,
//
//     // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
//     // See the following for more information:
//     // https://docs.sentry.io/product/crons/
//     // https://vercel.com/docs/cron-jobs
//     automaticVercelMonitors: true,
// });

export default withNextIntl(nextConfig);

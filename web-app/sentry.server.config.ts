import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://4102d305ba10c83a9b42006fb53ab1d6@o4510426617085952.ingest.us.sentry.io/4510426695401472",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
});

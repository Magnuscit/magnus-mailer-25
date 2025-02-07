import * as Sentry from "@sentry/node";

const ENVIRONMENT = process.env.NODE_ENV || "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: ENVIRONMENT,
  tracesSampleRate: 1.0,
});

export default Sentry;

import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'


Sentry.init({
  dsn: 'https://5a590bbf1fc65a9dac169cc86d33c5f9@o49777.ingest.us.sentry.io/4507750285770752',
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
})

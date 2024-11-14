import * as Sentry from '@sentry/svelte';
import { BrowserTracing } from '@sentry/browser';
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function initializeMonitoring() {
  // Initialize Sentry
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      // Don't send events in development
      if (import.meta.env.DEV) {
        console.error('Sentry Event:', event);
        return null;
      }
      return event;
    }
  });

  // Web Vitals monitoring
  const reportWebVital = ({ name, value, id }: { name: string, value: number, id: string }) => {
    Sentry.addBreadcrumb({
      category: 'Web Vitals',
      message: `${name}: ${value}`,
      level: 'info',
      data: { id, value }
    });
  };

  // Monitor Core Web Vitals
  onCLS(reportWebVital);
  onFID(reportWebVital);
  onLCP(reportWebVital);
  onFCP(reportWebVital);
  onTTFB(reportWebVital);
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.DEV) {
    console.error('Error:', error, '\nContext:', context);
  } else {
    Sentry.captureException(error, {
      extra: context
    });
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (import.meta.env.DEV) {
    console.log(`[${level}] ${message}`);
  } else {
    Sentry.captureMessage(message, level);
  }
}

export function setUserContext(user: { id: string; email: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}
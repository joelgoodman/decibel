import './app.css';
import App from './App.svelte';
import { QueryClientProvider } from '@tanstack/svelte-query';
import { queryClient } from './lib/services/api';
import { auth } from './lib/stores/auth';
import { initializeMonitoring } from './lib/services/monitoring';

// Initialize monitoring
initializeMonitoring();

// Initialize auth state
auth.initialize();

const app = new App({
  target: document.getElementById('app')!,
  props: {
    url: window.location.pathname
  },
  context: new Map([
    ['queryClient', queryClient]
  ])
});

export default app;
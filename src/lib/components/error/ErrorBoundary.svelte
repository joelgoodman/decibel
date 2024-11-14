<!-- ErrorBoundary.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { captureError } from '../../services/monitoring';
  import Button from '../common/Button.svelte';

  export let fallback: (error: Error, reset: () => void) => void = undefined;
  
  let error: Error | null = null;
  let hasError = false;
  let errorInfo: { componentStack?: string } = {};

  function handleError(event: ErrorEvent) {
    error = event.error;
    hasError = true;

    // Capture error with monitoring service
    captureError(event.error, {
      componentStack: errorInfo.componentStack,
      location: window.location.href
    });

    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error);
    }
  }

  function reset() {
    error = null;
    hasError = false;
    errorInfo = {};
  }

  onMount(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new ErrorEvent('error', { error: event.reason }));
    });
  });

  onDestroy(() => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleError);
  });
</script>

{#if hasError}
  {#if fallback}
    <svelte:component this={fallback} {error} reset={reset} />
  {:else}
    <div class="error-container">
      <div class="error-content">
        <h1>Something went wrong</h1>
        <p class="error-message">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {#if import.meta.env.DEV && error?.stack}
          <pre class="error-stack">{error.stack}</pre>
        {/if}
        <div class="error-actions">
          <Button variant="secondary" on:click={reset}>Try Again</Button>
          <Button variant="primary" on:click={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    </div>
  {/if}
{:else}
  <slot />
{/if}

<style>
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: var(--space-4);
  }

  .error-content {
    text-align: center;
    max-width: 600px;
  }

  h1 {
    color: var(--error);
    margin-bottom: var(--space-4);
  }

  .error-message {
    color: var(--text-secondary);
    margin-bottom: var(--space-6);
  }

  .error-stack {
    text-align: left;
    background: var(--bg-secondary);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin-bottom: var(--space-6);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .error-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
  }
</style>
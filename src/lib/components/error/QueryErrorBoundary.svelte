<!-- QueryErrorBoundary.svelte -->
<script lang="ts">
  import { useQueryErrorResetBoundary } from '@tanstack/svelte-query';
  import { captureError } from '../../services/monitoring';
  import Button from '../common/Button.svelte';

  export let error: Error;
  const { reset } = useQueryErrorResetBoundary();

  // Report query errors
  $: if (error) {
    captureError(error, {
      type: 'QueryError',
      location: window.location.href
    });
  }
</script>

<div class="query-error">
  <div class="query-error__content">
    <h2>Data Loading Error</h2>
    <p class="query-error__message">{error.message}</p>
    {#if import.meta.env.DEV && error.stack}
      <pre class="query-error__stack">{error.stack}</pre>
    {/if}
    <Button variant="primary" on:click={reset}>Retry</Button>
  </div>
</div>

<style>
  .query-error {
    padding: var(--space-6);
    background-color: var(--error-light);
    border-radius: var(--radius-lg);
    margin: var(--space-4) 0;
  }

  .query-error__content {
    text-align: center;
  }

  h2 {
    color: var(--error);
    margin-bottom: var(--space-3);
  }

  .query-error__message {
    color: var(--error-dark);
    margin-bottom: var(--space-4);
  }

  .query-error__stack {
    text-align: left;
    background: var(--bg-secondary);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }
</style>
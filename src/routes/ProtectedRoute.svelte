<script lang="ts">
  import { navigate } from 'svelte-routing';
  import { auth } from '../lib/stores/auth';
  import LoadingSpinner from '../lib/components/common/LoadingSpinner.svelte';

  export let permission: string | undefined = undefined;

  $: if (!$auth.isLoading && !$auth.isAuthenticated) {
    navigate('/login', { replace: true });
  }
</script>

{#if $auth.isLoading}
  <div class="loading-container">
    <LoadingSpinner />
  </div>
{:else if $auth.isAuthenticated}
  {#if !permission || $auth.user?.roles.includes('owner') || $auth.user?.roles.includes(permission)}
    <slot />
  {:else}
    <div class="access-denied">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
    </div>
  {/if}
{/if}

<style>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .access-denied {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .access-denied h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .access-denied p {
    color: var(--text-muted);
  }

  :global(.dark) {
    --text-muted: #9ca3af;
  }

  :global(:not(.dark)) {
    --text-muted: #6b7280;
  }
</style>
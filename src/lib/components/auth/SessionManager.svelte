<script lang="ts">
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { session } from '../../stores/session';
  import { auth } from '../../stores/auth';
  import { fade } from 'svelte/transition';

  const sessionStatus = derived(
    [session, auth],
    ([$session, $auth]) => {
      if (!$auth.isAuthenticated) return 'inactive';
      
      const timeUntilExpiry = $session.expiresAt - Date.now();
      if (timeUntilExpiry <= 0) return 'expired';
      if (timeUntilExpiry <= 60000) return 'expiring'; // Last minute
      return 'active';
    }
  );

  let showWarning = false;

  $: {
    showWarning = $sessionStatus === 'expiring';
  }

  onMount(() => {
    if ($auth.isAuthenticated) {
      session.resetTimers();
    }
  });
</script>

{#if showWarning}
  <div class="session-warning" transition:fade>
    <p>Your session will expire soon. Click anywhere to stay logged in.</p>
  </div>
{/if}

<style>
  .session-warning {
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    background-color: var(--warning-light);
    color: var(--warning-dark);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    z-index: 50;
    max-width: 300px;
  }

  p {
    font-size: var(--font-size-sm);
    margin: 0;
  }
</style>
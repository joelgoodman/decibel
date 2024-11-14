<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { auth } from '../../stores/auth';
  import { session } from '../../stores/session';
  import LoadingSpinner from '../common/LoadingSpinner.svelte';

  export let permission: string | undefined = undefined;
  export let redirectTo = '/login';

  let isAuthorized = false;

  $: {
    if (!$auth.isLoading) {
      if (!$auth.isAuthenticated) {
        navigate(redirectTo, { replace: true });
      } else if (permission) {
        isAuthorized = $auth.user?.roles.includes('owner') || 
                      $auth.user?.roles.includes(permission);
      } else {
        isAuthorized = true;
      }
    }
  }

  onMount(() => {
    if ($auth.isAuthenticated) {
      session.resetTimers();
    }
  });
</script>

{#if $auth.isLoading}
  <div class="loading">
    <LoadingSpinner />
  </div>
{:else if isAuthorized}
  <slot />
{:else if $auth.isAuthenticated}
  <div class="access-denied">
    <h1>Access Denied</h1>
    <p>You don't have permission to access this page.</p>
  </div>
{/if}

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .access-denied {
    padding: var(--space-8);
    text-align: center;
  }

  .access-denied h1 {
    color: var(--error);
    margin-bottom: var(--space-4);
  }

  .access-denied p {
    color: var(--text-secondary);
  }
</style>
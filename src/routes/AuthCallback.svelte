<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { handleAuthCallback } from '@lib/services/auth';
  import { auth } from '@lib/stores/auth';

  let error = '';

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      error = 'No authentication code provided';
      return;
    }

    try {
      await handleAuthCallback(code);
      navigate('/dashboard');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Authentication failed';
      setTimeout(() => navigate('/login'), 3000);
    }
  });
</script>

<div class="callback-container">
  {#if $auth.isLoading}
    <p>Completing authentication...</p>
  {:else if error}
    <p class="error">
      {error}
      <br>
      Redirecting to login...
    </p>
  {/if}
</div>

<style>
  .callback-container {
    max-width: 400px;
    margin: 2rem auto;
    text-align: center;
  }

  .error {
    color: #c00;
  }
</style>
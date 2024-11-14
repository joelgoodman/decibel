<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TextField from '../../../common/TextField.svelte';
  import Button from '../../../common/Button.svelte';

  export let config: {
    host: string;
    port: number;
    username: string;
    password: string;
    from: string;
  };

  const dispatch = createEventDispatcher();
  let testEmail = '';
  let testing = false;
  let error = '';

  async function handleTest() {
    if (!testEmail) {
      error = 'Test email address is required';
      return;
    }

    if (!config.host || !config.username || !config.password) {
      error = 'Please configure SMTP settings first';
      return;
    }

    testing = true;
    error = '';

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: testEmail,
          config
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send test email');
      }

      dispatch('test', { success: true });
      testEmail = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to send test email';
      dispatch('test', { success: false, message: error });
    } finally {
      testing = false;
    }
  }
</script>

<div class="smtp-tester">
  <h4>Test Configuration</h4>

  {#if error}
    <div class="error" role="alert">
      {error}
    </div>
  {/if}

  <div class="test-form">
    <TextField
      id="test-email"
      label="Send test email to"
      type="email"
      bind:value={testEmail}
      placeholder="Enter email address"
    />

    <Button
      variant="secondary"
      on:click={handleTest}
      disabled={testing}
    >
      {testing ? 'Sending...' : 'Send Test Email'}
    </Button>
  </div>
</div>

<style>
  .smtp-tester {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }

  h4 {
    font-size: var(--font-size-base);
    font-weight: 500;
    margin: 0 0 var(--space-4);
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }

  .test-form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-4);
    align-items: flex-end;
  }

  @media (max-width: 640px) {
    .test-form {
      grid-template-columns: 1fr;
    }
  }
</style>
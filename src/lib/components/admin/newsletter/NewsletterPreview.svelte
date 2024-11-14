<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { api } from '../../../lib/services/api';
  import Button from '../../common/Button.svelte';
  import TextField from '../../common/TextField.svelte';

  export let contentId: string;
  export let title: string;

  const dispatch = createEventDispatcher();
  let testEmail = '';
  let sending = false;
  let error = '';

  async function handleSendTest() {
    if (!testEmail) {
      error = 'Please enter a test email address';
      return;
    }

    sending = true;
    error = '';

    try {
      await api.sendNewsletter({
        contentId,
        test: true,
        testEmail
      });
      dispatch('success', { message: 'Test email sent successfully' });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to send test email';
    } finally {
      sending = false;
    }
  }

  async function handleSend() {
    if (!confirm('Are you sure you want to send this newsletter to all subscribers?')) {
      return;
    }

    sending = true;
    error = '';

    try {
      await api.sendNewsletter({ contentId });
      dispatch('success', { message: 'Newsletter sending started' });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to send newsletter';
    } finally {
      sending = false;
    }
  }
</script>

<div class="newsletter-preview">
  <header class="preview-header">
    <h2>Send Newsletter</h2>
    <button class="close-button" on:click={() => dispatch('close')}>×</button>
  </header>

  {#if error}
    <div class="error" role="alert">
      {error}
    </div>
  {/if}

  <div class="preview-content">
    <div class="info">
      <h3>{title}</h3>
      <p class="description">
        Preview and send your newsletter to subscribers
      </p>
    </div>

    <div class="test-section">
      <h4>Send Test Email</h4>
      <div class="test-form">
        <TextField
          id="test-email"
          label="Test Email Address"
          type="email"
          bind:value={testEmail}
          placeholder="Enter email for test"
        />
        <Button
          variant="secondary"
          on:click={handleSendTest}
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send Test'}
        </Button>
      </div>
    </div>

    <div class="send-section">
      <h4>Send to All Subscribers</h4>
      <p class="warning">
        This will send the newsletter to all active subscribers.
        Make sure to send a test email first!
      </p>
      <Button
        variant="primary"
        on:click={handleSend}
        disabled={sending}
      >
        {sending ? 'Sending...' : 'Send Newsletter'}
      </Button>
    </div>
  </div>
</div>

<style>
  .newsletter-preview {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 600px;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--border-primary);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-md);
  }

  .close-button:hover {
    background: var(--bg-secondary);
  }

  .error {
    margin: var(--space-4) var(--space-6);
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
  }

  .preview-content {
    padding: var(--space-6);
  }

  .info {
    margin-bottom: var(--space-6);
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: 0 0 var(--space-2);
  }

  .description {
    color: var(--text-secondary);
    margin: 0;
  }

  .test-section,
  .send-section {
    background: var(--bg-secondary);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }

  h4 {
    font-size: var(--font-size-base);
    font-weight: 500;
    margin: 0 0 var(--space-3);
  }

  .test-form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-3);
    align-items: flex-end;
  }

  .warning {
    color: var(--warning-dark);
    background: var(--warning-light);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
  }

  @media (max-width: 640px) {
    .test-form {
      grid-template-columns: 1fr;
    }
  }
</style>
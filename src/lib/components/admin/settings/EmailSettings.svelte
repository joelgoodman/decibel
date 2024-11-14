<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TextField from '../../common/TextField.svelte';
  import Button from '../../common/Button.svelte';
  import TemplateEditor from './email/TemplateEditor.svelte';
  import SmtpTester from './email/SmtpTester.svelte';

  export let settings = {
    smtp: {
      host: '',
      port: 587,
      username: '',
      password: '',
      from: '',
      replyTo: ''
    },
    templates: {
      default: {
        subject: '',
        content: ''
      },
      welcome: {
        subject: '',
        content: ''
      },
      newsletter: {
        subject: '',
        content: ''
      }
    },
    subscription: {
      confirmRequired: true,
      welcomeEmail: true,
      unsubscribeFooter: true
    }
  };
  export let saving = false;

  const dispatch = createEventDispatcher();
  let error = '';
  let activeTemplate = 'default';
  let testEmailStatus = '';

  const templates = [
    { id: 'default', name: 'Default Template' },
    { id: 'welcome', name: 'Welcome Email' },
    { id: 'newsletter', name: 'Newsletter' }
  ];

  async function handleSave() {
    if (!settings.smtp.host || !settings.smtp.username) {
      error = 'SMTP configuration is required';
      return;
    }

    dispatch('save', settings);
  }

  async function handleTestEmail(event: CustomEvent) {
    const { success, message } = event.detail;
    testEmailStatus = success ? 'Email sent successfully!' : `Failed: ${message}`;
    setTimeout(() => testEmailStatus = '', 3000);
  }
</script>

<div class="email-settings">
  <header class="section-header">
    <div>
      <h2>Email & Newsletter</h2>
      <p class="description">Configure email delivery and newsletter templates</p>
    </div>
    <Button
      variant="primary"
      on:click={handleSave}
      disabled={saving}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  </header>

  {#if error}
    <div class="error" role="alert">
      {error}
    </div>
  {/if}

  {#if testEmailStatus}
    <div class="status" class:success={testEmailStatus.includes('success')}>
      {testEmailStatus}
    </div>
  {/if}

  <div class="settings-grid">
    <div class="form-section">
      <h3>SMTP Configuration</h3>
      
      <div class="smtp-grid">
        <TextField
          id="smtp-host"
          label="SMTP Host"
          bind:value={settings.smtp.host}
          required
        />

        <TextField
          id="smtp-port"
          label="Port"
          type="number"
          bind:value={settings.smtp.port}
          required
        />

        <TextField
          id="smtp-username"
          label="Username"
          bind:value={settings.smtp.username}
          required
        />

        <TextField
          id="smtp-password"
          label="Password"
          type="password"
          bind:value={settings.smtp.password}
          required
        />

        <TextField
          id="smtp-from"
          label="From Address"
          type="email"
          bind:value={settings.smtp.from}
          required
        />

        <TextField
          id="smtp-reply"
          label="Reply-To Address"
          type="email"
          bind:value={settings.smtp.replyTo}
        />
      </div>

      <SmtpTester
        config={settings.smtp}
        on:test={handleTestEmail}
      />
    </div>

    <div class="form-section">
      <h3>Email Templates</h3>
      
      <div class="template-nav">
        {#each templates as template}
          <button
            class="template-button"
            class:active={activeTemplate === template.id}
            on:click={() => activeTemplate = template.id}
          >
            {template.name}
          </button>
        {/each}
      </div>

      <TemplateEditor
        template={settings.templates[activeTemplate]}
        on:change={(e) => settings.templates[activeTemplate] = e.detail}
      />
    </div>

    <div class="form-section">
      <h3>Subscription Settings</h3>
      
      <div class="checkbox-group">
        <label class="checkbox">
          <input
            type="checkbox"
            bind:checked={settings.subscription.confirmRequired}
          />
          Require email confirmation for new subscribers
        </label>

        <label class="checkbox">
          <input
            type="checkbox"
            bind:checked={settings.subscription.welcomeEmail}
          />
          Send welcome email to new subscribers
        </label>

        <label class="checkbox">
          <input
            type="checkbox"
            bind:checked={settings.subscription.unsubscribeFooter}
          />
          Include unsubscribe link in footer
        </label>
      </div>
    </div>
  </div>
</div>

<style>
  .email-settings {
    max-width: 800px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--space-2);
  }

  .description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
  }

  .status {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
    text-align: center;
  }

  .status.success {
    background: var(--success-light);
    color: var(--success);
  }

  .settings-grid {
    display: grid;
    gap: var(--space-8);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: 500;
    margin: 0;
  }

  .smtp-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .template-nav {
    display: flex;
    gap: var(--space-2);
    border-bottom: 1px solid var(--border-primary);
    margin-bottom: var(--space-4);
  }

  .template-button {
    padding: var(--space-2) var(--space-4);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .template-button:hover {
    color: var(--text-primary);
  }

  .template-button.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  @media (max-width: 640px) {
    .smtp-grid {
      grid-template-columns: 1fr;
    }

    .template-nav {
      flex-direction: column;
    }

    .template-button {
      text-align: left;
    }
  }
</style>
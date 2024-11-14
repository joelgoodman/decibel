<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { useMutation } from '@tanstack/svelte-query';
  import { api } from '../../../lib/services/api';
  import Button from '../../common/Button.svelte';

  const dispatch = createEventDispatcher();
  let importing = false;
  let error = '';

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.importSubscribers(formData);
    },
    onSuccess: () => {
      dispatch('success');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Import failed';
    }
  });

  async function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'text/csv') {
      error = 'Please select a CSV file';
      return;
    }

    importing = true;
    error = '';

    try {
      await importMutation.mutateAsync(file);
    } finally {
      importing = false;
      input.value = ''; // Reset input
    }
  }

  async function handleExport() {
    try {
      const response = await fetch('/api/subscribers/export', {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Export failed';
    }
  }
</script>

<div class="subscriber-actions">
  {#if error}
    <div class="error" role="alert">
      {error}
    </div>
  {/if}

  <div class="actions">
    <div class="import">
      <input
        type="file"
        accept=".csv"
        on:change={handleImport}
        class="file-input"
        disabled={importing}
      />
      <Button
        variant="secondary"
        disabled={importing}
      >
        {importing ? 'Importing...' : 'Import CSV'}
      </Button>
    </div>

    <Button
      variant="secondary"
      on:click={handleExport}
    >
      Export CSV
    </Button>
  </div>

  <div class="help">
    <details>
      <summary>CSV Format Instructions</summary>
      <div class="help-content">
        <p>The CSV file should contain the following columns:</p>
        <ul>
          <li><code>email</code> (required)</li>
          <li><code>name</code> (optional)</li>
          <li><code>roles</code> (optional, comma-separated)</li>
          <li><code>subscription_type</code> (optional: free, paid, premium)</li>
        </ul>
        <p>Example:</p>
        <pre>email,name,roles,subscription_type
john@example.com,John Doe,subscriber,free
jane@example.com,Jane Smith,"subscriber,premium",premium</pre>
      </div>
    </details>
  </div>
</div>

<style>
  .subscriber-actions {
    margin-bottom: var(--space-6);
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }

  .actions {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .import {
    position: relative;
  }

  .file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  .help {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  summary {
    cursor: pointer;
    color: var(--primary);
  }

  summary:hover {
    text-decoration: underline;
  }

  .help-content {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  .help-content p {
    margin: var(--space-2) 0;
  }

  .help-content ul {
    margin: var(--space-2) 0;
    padding-left: var(--space-4);
  }

  code {
    font-family: var(--font-mono);
    background: var(--bg-tertiary);
    padding: 0.1em 0.3em;
    border-radius: var(--radius-sm);
  }

  pre {
    background: var(--bg-tertiary);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
  }
</style>
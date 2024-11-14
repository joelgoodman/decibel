<script lang="ts">
  export let template: {
    subject: string;
    content: string;
  };
  export let type: string;

  let previewFrame: HTMLIFrameElement;
  let loading = true;
  let error = '';

  $: if (previewFrame && type) {
    loadPreview();
  }

  async function loadPreview() {
    try {
      loading = true;
      error = '';

      const response = await fetch(`http://localhost:3002/preview/${type}`);
      if (!response.ok) throw new Error('Failed to load preview');

      const html = await response.text();
      const doc = previewFrame.contentDocument;
      
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load preview';
    } finally {
      loading = false;
    }
  }
</script>

<div class="preview-modal">
  <div class="preview-content">
    <header class="preview-header">
      <h3>Email Preview</h3>
      <button class="close-button" on:click>×</button>
    </header>

    <div class="preview-body">
      {#if loading}
        <div class="loading">Loading preview...</div>
      {:else if error}
        <div class="error">{error}</div>
      {/if}

      <iframe
        bind:this={previewFrame}
        title="Email Preview"
        class="preview-frame"
        sandbox="allow-same-origin"
      ></iframe>
    </div>
  </div>
</div>

<style>
  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .preview-content {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    border-bottom: 1px solid var(--border-primary);
  }

  h3 {
    font-size: var(--font-size-lg);
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

  .preview-body {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .preview-frame {
    width: 100%;
    height: 100%;
    border: none;
  }

  .loading,
  .error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: var(--space-4);
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow);
  }

  .error {
    color: var(--error);
  }
</style>
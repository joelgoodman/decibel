<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { marked } from 'marked';
  import TextField from '../../../common/TextField.svelte';
  import Button from '../../../common/Button.svelte';

  export let template = {
    subject: '',
    content: ''
  };

  const dispatch = createEventDispatcher();
  let previewMode = false;
  let error = '';

  const variables = [
    { key: '{{name}}', description: 'Subscriber\'s name' },
    { key: '{{email}}', description: 'Subscriber\'s email' },
    { key: '{{unsubscribe_url}}', description: 'Unsubscribe link' },
    { key: '{{date}}', description: 'Current date' }
  ];

  function insertVariable(variable: string) {
    template.content += variable;
    dispatch('change', template);
  }

  function validateTemplate() {
    // Basic validation
    if (!template.subject) {
      error = 'Subject is required';
      return false;
    }
    if (!template.content) {
      error = 'Content is required';
      return false;
    }
    error = '';
    return true;
  }

  function handlePreview() {
    if (validateTemplate()) {
      previewMode = !previewMode;
    }
  }

  $: renderedContent = previewMode ? marked(template.content) : '';
</script>

<div class="template-editor">
  {#if error}
    <div class="error" role="alert">
      {error}
    </div>
  {/if}

  <div class="toolbar">
    <div class="variables">
      <span class="variables-label">Insert:</span>
      {#each variables as variable}
        <button
          class="variable-button"
          on:click={() => insertVariable(variable.key)}
          title={variable.description}
        >
          {variable.key}
        </button>
      {/each}
    </div>

    <Button
      variant="secondary"
      size="sm"
      on:click={handlePreview}
    >
      {previewMode ? 'Edit' : 'Preview'}
    </Button>
  </div>

  <div class="editor-content">
    {#if !previewMode}
      <TextField
        id="subject"
        label="Email Subject"
        bind:value={template.subject}
        required
      />

      <div class="content-field">
        <label for="content">Email Content (Markdown)</label>
        <textarea
          id="content"
          bind:value={template.content}
          on:input={() => dispatch('change', template)}
          rows="15"
          placeholder="Write your email content here..."
        ></textarea>
      </div>
    {:else}
      <div class="preview">
        <div class="preview-subject">
          <strong>Subject:</strong> {template.subject}
        </div>
        <div class="preview-content">
          {@html renderedContent}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .template-editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  .variables {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    overflow-x: auto;
    padding-bottom: var(--space-2);
  }

  .variables-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .variable-button {
    padding: var(--space-1) var(--space-2);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--primary);
    cursor: pointer;
    white-space: nowrap;
  }

  .variable-button:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .editor-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .content-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  textarea {
    width: 100%;
    padding: var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    resize: vertical;
  }

  .preview {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }

  .preview-subject {
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-primary);
  }

  .preview-content {
    line-height: 1.6;
  }

  .preview-content :global(h1),
  .preview-content :global(h2),
  .preview-content :global(h3) {
    margin-top: var(--space-6);
    margin-bottom: var(--space-4);
  }

  .preview-content :global(p) {
    margin-bottom: var(--space-4);
  }

  .preview-content :global(ul),
  .preview-content :global(ol) {
    margin-bottom: var(--space-4);
    padding-left: var(--space-6);
  }

  @media (max-width: 640px) {
    .toolbar {
      flex-direction: column;
      gap: var(--space-2);
    }

    .variables {
      width: 100%;
    }
  }
</style>
<script lang="ts">
  import { onMount } from 'svelte';
  import { getHighlighter } from 'shiki';
  import type { CodeBlockData } from '../../../types/editor';
  import Button from '../../common/Button.svelte';
  import TextField from '../../common/TextField.svelte';
  
  export let value: CodeBlockData;
  export let readOnly = false;

  let highlightedCode = '';
  let editing = !value.code;

  const languages = [
    'javascript', 'typescript', 'html', 'css', 'json', 'markdown',
    'python', 'rust', 'sql', 'bash', 'yaml'
  ];

  onMount(async () => {
    if (value.code) {
      await highlightCode();
    }
  });

  async function highlightCode() {
    try {
      const highlighter = await getHighlighter({
        theme: 'github-dark',
        langs: [value.language || 'text']
      });

      highlightedCode = highlighter.codeToHtml(value.code, {
        lang: value.language || 'text',
        lineNumbers: value.showLineNumbers
      });
    } catch (error) {
      console.error('Code highlighting error:', error);
      highlightedCode = `<pre><code>${value.code}</code></pre>`;
    }
  }

  function handleChange(updates: Partial<CodeBlockData>) {
    dispatch('change', { ...value, ...updates });
    if (updates.code || updates.language) {
      highlightCode();
    }
  }
</script>

<div class="code-block">
  {#if editing && !readOnly}
    <div class="editor">
      <div class="controls">
        <select
          value={value.language}
          on:change={(e) => handleChange({ language: e.target.value })}
        >
          <option value="">Select language</option>
          {#each languages as lang}
            <option value={lang}>{lang}</option>
          {/each}
        </select>

        <label class="checkbox">
          <input
            type="checkbox"
            checked={value.showLineNumbers}
            on:change={(e) => handleChange({ showLineNumbers: e.target.checked })}
          />
          Show line numbers
        </label>
      </div>

      <textarea
        value={value.code}
        on:input={(e) => handleChange({ code: e.target.value })}
        placeholder="Enter your code here..."
        spellcheck="false"
      ></textarea>

      <div class="actions">
        <Button
          variant="primary"
          size="sm"
          on:click={() => editing = false}
          disabled={!value.code}
        >
          Done
        </Button>
      </div>
    </div>
  {:else}
    <div class="preview">
      {@html highlightedCode}
      
      {#if !readOnly}
        <button
          class="edit-button"
          on:click={() => editing = true}
          title="Edit code"
        >
          ✎
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .code-block {
    width: 100%;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .editor {
    background: var(--bg-secondary);
    padding: var(--space-4);
    border-radius: var(--radius-md);
  }

  .controls {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  select {
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  textarea {
    width: 100%;
    min-height: 200px;
    padding: var(--space-4);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    resize: vertical;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-4);
  }

  .preview {
    position: relative;
  }

  .preview :global(pre) {
    margin: 0;
    padding: var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    overflow-x: auto;
  }

  .edit-button {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    opacity: 0;
    transition: opacity var(--transition);
  }

  .preview:hover .edit-button {
    opacity: 1;
  }
</style>
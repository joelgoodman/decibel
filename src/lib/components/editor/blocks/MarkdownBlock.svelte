<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import Prism from 'prismjs';
  import { sanitizeHtml } from '../../../utils/editor';
  
  export let value: {
    markdown: string;
    preview: boolean;
  };
  export let readOnly = false;

  let editor: HTMLTextAreaElement;
  let renderedContent = '';

  $: if (value.markdown) {
    renderMarkdown();
  }

  onMount(() => {
    if (!readOnly) {
      editor?.focus();
    }
  });

  async function renderMarkdown() {
    try {
      const html = await marked(value.markdown, {
        gfm: true,
        breaks: true,
        highlight: (code, lang) => {
          if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
          }
          return code;
        }
      });
      renderedContent = sanitizeHtml(html);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      renderedContent = '<p>Error rendering markdown</p>';
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    dispatch('change', {
      ...value,
      markdown: target.value
    });
  }
</script>

<div class="markdown-block">
  {#if !readOnly && !value.preview}
    <textarea
      bind:this={editor}
      class="editor"
      value={value.markdown}
      on:input={handleInput}
      placeholder="Write your markdown here..."
    ></textarea>
  {/if}

  {#if value.preview || readOnly}
    <div class="preview">
      {@html renderedContent}
    </div>
  {/if}

  {#if !readOnly}
    <div class="controls">
      <button
        class="control-button"
        class:active={value.preview}
        on:click={() => dispatch('change', { ...value, preview: !value.preview })}
      >
        {value.preview ? 'Edit' : 'Preview'}
      </button>
    </div>
  {/if}
</div>

<style>
  .markdown-block {
    position: relative;
    width: 100%;
  }

  .editor {
    width: 100%;
    min-height: 200px;
    padding: var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    resize: vertical;
  }

  .editor:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }

  .preview {
    padding: var(--space-4);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
  }

  .controls {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-2);
  }

  .control-button {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition);
  }

  .control-button:hover {
    background: var(--bg-secondary);
  }

  .control-button.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }
</style>
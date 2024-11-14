<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PullquoteBlockData } from '../../../types/editor';
  import TextField from '../../common/TextField.svelte';
  
  export let value: PullquoteBlockData;
  export let readOnly = false;

  const dispatch = createEventDispatcher();

  const styles = [
    { value: 'default', label: 'Default' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' }
  ];

  function handleChange(updates: Partial<PullquoteBlockData>) {
    dispatch('change', { ...value, ...updates });
  }
</script>

<div 
  class="pullquote"
  class:pullquote--default={value.style === 'default'}
  class:pullquote--modern={value.style === 'modern'}
  class:pullquote--minimal={value.style === 'minimal'}
>
  {#if !readOnly}
    <div class="controls">
      <select
        value={value.style}
        on:change={(e) => handleChange({ style: e.target.value as 'default' | 'modern' | 'minimal' })}
      >
        {#each styles as style}
          <option value={style.value}>{style.label}</option>
        {/each}
      </select>
    </div>

    <textarea
      value={value.quote}
      on:input={(e) => handleChange({ quote: e.target.value })}
      placeholder="Enter quote..."
    ></textarea>

    <TextField
      id="citation"
      label="Citation"
      value={value.citation || ''}
      on:input={(e) => handleChange({ citation: e.target.value })}
      placeholder="Optional citation"
    />
  {:else}
    <blockquote>
      <p>{value.quote}</p>
      {#if value.citation}
        <cite>{value.citation}</cite>
      {/if}
    </blockquote>
  {/if}
</div>

<style>
  .pullquote {
    width: 100%;
    padding: var(--space-4) 0;
  }

  .controls {
    margin-bottom: var(--space-4);
  }

  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
  }

  textarea {
    width: 100%;
    min-height: 120px;
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    font-size: var(--font-size-lg);
    line-height: 1.6;
    resize: vertical;
  }

  blockquote {
    margin: 0;
    padding: 0;
  }

  .pullquote--default blockquote {
    padding-left: var(--space-6);
    border-left: 4px solid var(--primary);
  }

  .pullquote--modern blockquote {
    position: relative;
    padding: var(--space-6);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
  }

  .pullquote--modern blockquote::before {
    content: '"';
    position: absolute;
    top: -0.5em;
    left: 0.2em;
    font-size: 4em;
    color: var(--primary);
    opacity: 0.2;
  }

  .pullquote--minimal blockquote {
    text-align: center;
    font-size: var(--font-size-xl);
    font-style: italic;
  }

  p {
    margin: 0;
    font-size: var(--font-size-xl);
    line-height: 1.6;
  }

  cite {
    display: block;
    margin-top: var(--space-4);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-style: normal;
  }

  .pullquote--minimal cite::before {
    content: '— ';
  }
</style>
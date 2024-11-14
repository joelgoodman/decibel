<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CalloutBlockData } from '../../../types/editor';
  import TextField from '../../common/TextField.svelte';
  
  export let value: CalloutBlockData;
  export let readOnly = false;

  const dispatch = createEventDispatcher();

  const types = [
    { value: 'info', label: 'Info', icon: 'ℹ️' },
    { value: 'warning', label: 'Warning', icon: '⚠️' },
    { value: 'success', label: 'Success', icon: '✅' },
    { value: 'error', label: 'Error', icon: '❌' }
  ];

  function handleChange(updates: Partial<CalloutBlockData>) {
    dispatch('change', { ...value, ...updates });
  }
</script>

<div 
  class="callout"
  class:callout--info={value.type === 'info'}
  class:callout--warning={value.type === 'warning'}
  class:callout--success={value.type === 'success'}
  class:callout--error={value.type === 'error'}
>
  {#if !readOnly}
    <div class="controls">
      <select
        value={value.type}
        on:change={(e) => handleChange({ type: e.target.value })}
      >
        {#each types as type}
          <option value={type.value}>
            {type.icon} {type.label}
          </option>
        {/each}
      </select>
    </div>
  {/if}

  <div class="content">
    <span class="icon">
      {types.find(t => t.value === value.type)?.icon}
    </span>

    <div class="text">
      {#if !readOnly}
        <TextField
          id="title"
          label="Title"
          value={value.title || ''}
          on:input={(e) => handleChange({ title: e.target.value })}
          placeholder="Optional title"
        />
      {:else if value.title}
        <h4>{value.title}</h4>
      {/if}

      {#if !readOnly}
        <textarea
          value={value.content}
          on:input={(e) => handleChange({ content: e.target.value })}
          placeholder="Enter content..."
        ></textarea>
      {:else}
        <p>{value.content}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .callout {
    padding: var(--space-4);
    border-radius: var(--radius-md);
    border-left: 4px solid;
  }

  .callout--info {
    background: var(--info-light);
    border-left-color: var(--info);
  }

  .callout--warning {
    background: var(--warning-light);
    border-left-color: var(--warning);
  }

  .callout--success {
    background: var(--success-light);
    border-left-color: var(--success);
  }

  .callout--error {
    background: var(--error-light);
    border-left-color: var(--error);
  }

  .controls {
    margin-bottom: var(--space-4);
  }

  select {
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
  }

  .content {
    display: flex;
    gap: var(--space-3);
  }

  .icon {
    flex-shrink: 0;
    font-size: 1.25rem;
  }

  .text {
    flex: 1;
    min-width: 0;
  }

  h4 {
    margin: 0 0 var(--space-2);
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  textarea {
    width: 100%;
    min-height: 100px;
    padding: var(--space-2);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    resize: vertical;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
</style>
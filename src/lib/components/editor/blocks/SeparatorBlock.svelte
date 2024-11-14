<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SeparatorBlockData } from '../../../types/editor';
  
  export let value: SeparatorBlockData;
  export let readOnly = false;

  const dispatch = createEventDispatcher();

  const styles = [
    { value: 'line', label: 'Line' },
    { value: 'dots', label: 'Dots' },
    { value: 'wave', label: 'Wave' }
  ];

  const spacings = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  function handleChange(updates: Partial<SeparatorBlockData>) {
    dispatch('change', { ...value, ...updates });
  }
</script>

<div class="separator">
  {#if !readOnly}
    <div class="controls">
      <select
        value={value.style}
        on:change={(e) => handleChange({ style: e.target.value as 'line' | 'dots' | 'wave' })}
      >
        {#each styles as style}
          <option value={style.value}>{style.label}</option>
        {/each}
      </select>

      <select
        value={value.spacing}
        on:change={(e) => handleChange({ spacing: e.target.value as 'small' | 'medium' | 'large' })}
      >
        {#each spacings as spacing}
          <option value={spacing.value}>{spacing.label}</option>
        {/each}
      </select>

      <input
        type="color"
        value={value.color || '#e5e7eb'}
        on:input={(e) => handleChange({ color: e.target.value })}
      />
    </div>
  {/if}

  <hr
    class="separator__line"
    class:separator__line--dots={value.style === 'dots'}
    class:separator__line--wave={value.style === 'wave'}
    class:separator__line--small={value.spacing === 'small'}
    class:separator__line--medium={value.spacing === 'medium'}
    class:separator__line--large={value.spacing === 'large'}
    style="--separator-color: {value.color || 'var(--border-primary)'}"
  />
</div>

<style>
  .separator {
    width: 100%;
  }

  .controls {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
  }

  input[type="color"] {
    width: 40px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .separator__line {
    width: 100%;
    border: none;
    margin: 0;
  }

  .separator__line--small {
    margin: var(--space-2) 0;
  }

  .separator__line--medium {
    margin: var(--space-6) 0;
  }

  .separator__line--large {
    margin: var(--space-12) 0;
  }

  .separator__line {
    height: 1px;
    background-color: var(--separator-color);
  }

  .separator__line--dots {
    height: 1px;
    background-image: linear-gradient(to right, var(--separator-color) 50%, transparent 50%);
    background-position: top;
    background-size: 8px 1px;
    background-repeat: repeat-x;
  }

  .separator__line--wave {
    height: 6px;
    background-image: linear-gradient(45deg, transparent 33.33%, var(--separator-color) 33.33%, var(--separator-color) 66.66%, transparent 66.66%);
    background-size: 16px 6px;
  }
</style>
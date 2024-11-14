<script lang="ts">
  import { createSelect } from '@melt-ui/svelte';
  import { theme } from '../../stores/theme';
  import { fade } from 'svelte/transition';

  const options = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' }
  ];

  const {
    elements: { trigger, menu, option },
    states: { selectedValue, open },
  } = createSelect({
    defaultValue: $theme,
    onValueChange: ({ value }) => theme.set(value),
    options
  });
</script>

<div class="theme-toggle">
  <button
    {...$trigger}
    class="theme-button"
    aria-label="Toggle theme"
  >
    {options.find(opt => opt.value === $selectedValue)?.icon}
  </button>

  {#if $open}
    <div
      {...$menu}
      class="theme-menu"
      transition:fade={{ duration: 100 }}
    >
      {#each options as opt}
        <button
          {...$option(opt)}
          class="theme-option"
          class:selected={opt.value === $selectedValue}
        >
          <span class="icon">{opt.icon}</span>
          <span class="label">{opt.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .theme-toggle {
    position: relative;
  }

  .theme-button {
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }

  .theme-button:hover {
    background-color: var(--color-hover);
  }

  .theme-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 50;
    min-width: 8rem;
  }

  .theme-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
    color: var(--color-text);
  }

  .theme-option:hover {
    background-color: var(--color-hover);
  }

  .theme-option.selected {
    background-color: var(--color-selected);
  }

  .icon {
    margin-right: 0.75rem;
  }

  .label {
    font-size: 0.875rem;
  }

  :global(.dark) {
    --color-background: #1f2937;
    --color-text: #f3f4f6;
    --color-border: #374151;
    --color-hover: #374151;
    --color-selected: #4b5563;
  }

  :global(:not(.dark)) {
    --color-background: #ffffff;
    --color-text: #1f2937;
    --color-border: #e5e7eb;
    --color-hover: #f3f4f6;
    --color-selected: #e5e7eb;
  }
</style>
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
</script>

<button
  {type}
  {disabled}
  class="button"
  class:button--primary={variant === 'primary'}
  class:button--secondary={variant === 'secondary'}
  class:button--ghost={variant === 'ghost'}
  class:button--sm={size === 'sm'}
  class:button--md={size === 'md'}
  class:button--lg={size === 'lg'}
  class:button--full={fullWidth}
  class:button--loading={loading}
  on:click
>
  {#if loading}
    <span class="button__spinner" />
  {/if}
  <span class="button__content" class:button__content--loading={loading}>
    <slot />
  </span>
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
  }

  .button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Variants */
  .button--primary {
    background-color: var(--primary);
    color: var(--text-inverted);
  }

  .button--primary:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }

  .button--secondary {
    background-color: var(--secondary);
    color: var(--text-primary);
  }

  .button--secondary:hover:not(:disabled) {
    background-color: var(--secondary-dark);
  }

  .button--ghost {
    background-color: transparent;
    color: var(--text-primary);
  }

  .button--ghost:hover:not(:disabled) {
    background-color: var(--bg-secondary);
  }

  /* Sizes */
  .button--sm {
    height: 2rem;
    padding: 0 var(--space-3);
    font-size: var(--font-size-sm);
  }

  .button--md {
    height: 2.5rem;
    padding: 0 var(--space-4);
    font-size: var(--font-size-base);
  }

  .button--lg {
    height: 3rem;
    padding: 0 var(--space-6);
    font-size: var(--font-size-lg);
  }

  .button--full {
    width: 100%;
  }

  /* Loading state */
  .button--loading {
    cursor: wait;
  }

  .button__spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .button__content {
    transition: opacity var(--transition);
  }

  .button__content--loading {
    opacity: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
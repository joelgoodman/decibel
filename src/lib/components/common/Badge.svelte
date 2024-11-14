<script lang="ts">
  export let variant: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default';
  export let size: 'sm' | 'md' = 'md';
</script>

<span 
  class="badge"
  class:badge--default={variant === 'default'}
  class:badge--success={variant === 'success'}
  class:badge--warning={variant === 'warning'}
  class:badge--error={variant === 'error'}
  class:badge--info={variant === 'info'}
  class:badge--sm={size === 'sm'}
  class:badge--md={size === 'md'}
>
  <slot />
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }

  .badge--sm {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-xs);
  }

  .badge--md {
    padding: var(--space-1) var(--space-3);
    font-size: var(--font-size-sm);
  }

  .badge--default {
    background-color: var(--secondary);
    color: var(--text-primary);
  }

  .badge--success {
    background-color: var(--success-light);
    color: var(--success-dark);
  }

  .badge--warning {
    background-color: var(--warning-light);
    color: var(--warning-dark);
  }

  .badge--error {
    background-color: var(--error-light);
    color: var(--error-dark);
  }

  .badge--info {
    background-color: var(--info-light);
    color: var(--info-dark);
  }
</style>
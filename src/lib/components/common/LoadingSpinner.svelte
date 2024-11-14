<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'default' | 'light' = 'default';
</script>

<div 
  class="spinner"
  class:spinner--sm={size === 'sm'}
  class:spinner--md={size === 'md'}
  class:spinner--lg={size === 'lg'}
  class:spinner--light={variant === 'light'}
  role="status"
>
  <span class="sr-only">Loading...</span>
</div>

<style>
  .spinner {
    display: inline-block;
    border-radius: 50%;
    border: 2px solid var(--border-primary);
    border-top-color: var(--primary);
    animation: spin 0.8s linear infinite;
  }

  .spinner--light {
    border-color: rgba(255, 255, 255, 0.2);
    border-top-color: var(--text-inverted);
  }

  .spinner--sm {
    width: 1rem;
    height: 1rem;
    border-width: 2px;
  }

  .spinner--md {
    width: 2rem;
    height: 2rem;
    border-width: 3px;
  }

  .spinner--lg {
    width: 3rem;
    height: 3rem;
    border-width: 4px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
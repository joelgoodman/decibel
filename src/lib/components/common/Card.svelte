<script lang="ts">
  export let variant: 'default' | 'outline' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let clickable = false;
</script>

{#if clickable}
  <button 
    type="button"
    class="card"
    class:card--outline={variant === 'outline'}
    class:card--clickable={clickable}
    class:card--padding-none={padding === 'none'}
    class:card--padding-sm={padding === 'sm'}
    class:card--padding-md={padding === 'md'}
    class:card--padding-lg={padding === 'lg'}
    on:click
    on:keydown
  >
    <slot />
  </button>
{:else}
  <div 
    class="card"
    class:card--outline={variant === 'outline'}
    class:card--padding-none={padding === 'none'}
    class:card--padding-sm={padding === 'sm'}
    class:card--padding-md={padding === 'md'}
    class:card--padding-lg={padding === 'lg'}
  >
    <slot />
  </div>
{/if}

<style>
  .card {
    width: 100%;
    text-align: left;
    background-color: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    transition: all var(--transition);
  }

  button.card {
    border: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .card--outline {
    border: 1px solid var(--border-primary);
    box-shadow: none;
  }

  .card--clickable:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .card--padding-none { padding: 0; }
  .card--padding-sm { padding: var(--space-3); }
  .card--padding-md { padding: var(--space-4); }
  .card--padding-lg { padding: var(--space-6); }
</style>
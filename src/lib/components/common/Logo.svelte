<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'default' | 'light' = 'default';
</script>

<div 
  class="logo"
  class:logo--sm={size === 'sm'}
  class:logo--md={size === 'md'}
  class:logo--lg={size === 'lg'}
  class:logo--light={variant === 'light'}
>
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span class="logo__text">Decibel</span>
</div>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--primary);
  }

  .logo--light {
    color: var(--text-inverted);
  }

  .logo--sm {
    font-size: var(--font-size-lg);
  }

  .logo--sm svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .logo--md {
    font-size: var(--font-size-xl);
  }

  .logo--md svg {
    width: 2rem;
    height: 2rem;
  }

  .logo--lg {
    font-size: var(--font-size-3xl);
  }

  .logo--lg svg {
    width: 3rem;
    height: 3rem;
  }

  .logo__text {
    font-weight: 700;
    letter-spacing: -0.025em;
  }
</style>
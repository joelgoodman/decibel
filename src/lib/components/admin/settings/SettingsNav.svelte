<script lang="ts">
  export let active = 'brand';

  const sections = [
    { id: 'brand', label: 'Brand & Identity', icon: '🎨' },
    { id: 'seo', label: 'SEO & Metadata', icon: '🔍' },
    { id: 'theme', label: 'Theme & Design', icon: '✨' },
    { id: 'email', label: 'Email & Newsletter', icon: '📧', disabled: true },
    { id: 'users', label: 'User Management', icon: '👥', disabled: true },
    { id: 'integrations', label: 'Integrations', icon: '🔌', disabled: true }
  ];
</script>

<nav class="settings-nav">
  {#each sections as section}
    <button
      class="nav-item"
      class:active={active === section.id}
      disabled={section.disabled}
      on:click={() => active = section.id}
    >
      <span class="icon">{section.icon}</span>
      <span class="label">{section.label}</span>
      {#if section.disabled}
        <span class="coming-soon">Coming Soon</span>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .settings-nav {
    padding: var(--space-4);
  }

  .nav-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: none;
    background: none;
    color: var(--text-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition);
    text-align: left;
    gap: var(--space-3);
  }

  .nav-item:hover:not(:disabled) {
    background: var(--bg-secondary);
  }

  .nav-item.active {
    background: var(--primary);
    color: white;
  }

  .nav-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    flex-shrink: 0;
  }

  .label {
    flex: 1;
  }

  .coming-soon {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
  }

  @media (max-width: 768px) {
    .settings-nav {
      display: flex;
      overflow-x: auto;
      padding: var(--space-2);
      gap: var(--space-2);
    }

    .nav-item {
      flex: 0 0 auto;
      width: auto;
    }
  }
</style>
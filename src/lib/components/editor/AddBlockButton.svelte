<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../common/Button.svelte';

  export let onAdd: (type: string) => void;
  
  const dispatch = createEventDispatcher();
  let showMenu = false;

  const blockTypes = [
    { id: 'text', label: 'Text', icon: '¶' },
    { id: 'image', label: 'Image', icon: '🖼' },
    { id: 'code', label: 'Code', icon: '⌨' }
  ];

  function handleAdd(type: string) {
    showMenu = false;
    onAdd(type);
    dispatch('add', { type });
  }
</script>

<div class="add-block">
  <Button
    variant="ghost"
    size="sm"
    on:click={() => showMenu = !showMenu}
  >
    + Add Block
  </Button>

  {#if showMenu}
    <div class="block-menu" transition:fade>
      {#each blockTypes as type}
        <button
          class="block-type"
          on:click={() => handleAdd(type.id)}
        >
          <span class="block-type__icon">{type.icon}</span>
          <span class="block-type__label">{type.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .add-block {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: var(--space-2) 0;
  }

  .block-menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: var(--space-2);
    z-index: 10;
  }

  .block-type {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: none;
    background: none;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background-color var(--transition);
  }

  .block-type:hover {
    background-color: var(--bg-secondary);
  }

  .block-type__icon {
    margin-right: var(--space-2);
  }

  .block-type__label {
    font-size: var(--font-size-sm);
  }
</style>
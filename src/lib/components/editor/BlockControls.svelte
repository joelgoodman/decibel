<script lang="ts">
  export let index: number;
  export let totalBlocks: number;
  export let onDelete: () => void;
  export let onMoveUp: () => void;
  export let onMoveDown: () => void;

  $: isFirst = index === 0;
  $: isLast = index === totalBlocks - 1;
</script>

<div class="controls">
  <button
    class="control-button"
    disabled={isFirst}
    on:click={onMoveUp}
    title="Move up"
  >
    ↑
  </button>
  
  <button
    class="control-button"
    disabled={isLast}
    on:click={onMoveDown}
    title="Move down"
  >
    ↓
  </button>
  
  <button
    class="control-button control-button--delete"
    on:click={onDelete}
    title="Delete block"
  >
    ×
  </button>
</div>

<style>
  .controls {
    position: absolute;
    left: -40px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    opacity: 0;
    transition: opacity var(--transition);
  }

  .controls:hover {
    opacity: 1;
  }

  .control-button {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition);
  }

  .control-button:hover:not(:disabled) {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-button--delete:hover {
    background: var(--error);
    color: white;
  }
</style>
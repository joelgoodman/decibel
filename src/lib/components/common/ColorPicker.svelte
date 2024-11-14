<script lang="ts">
  export let label: string;
  export let value = '#000000';
</script>

<div class="color-picker">
  <label>{label}</label>
  <div class="input-group">
    <input
      type="color"
      bind:value
      class="color-input"
    />
    <input
      type="text"
      bind:value
      class="text-input"
    />
  </div>
</div>

<style>
  .color-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .input-group {
    display: flex;
    gap: var(--space-2);
  }

  .color-input {
    width: 50px;
    height: 38px;
    padding: 0;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .text-input {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .text-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
</style>
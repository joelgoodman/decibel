<script lang="ts">
  export let id: string;
  export let label: string;
  export let type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text';
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let required = false;
  export let error = '';
  export let multiline = false;
  export let rows = 3;

  let inputElement: HTMLInputElement | HTMLTextAreaElement;

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    value = target.value;
  }
</script>

<div class="field">
  <label for={id} class="field__label">
    {label}
    {#if required}
      <span class="field__required">*</span>
    {/if}
  </label>
  
  {#if multiline}
    <textarea
      {id}
      bind:this={inputElement}
      {rows}
      {value}
      {placeholder}
      {disabled}
      {required}
      class="field__input"
      class:field__input--error={!!error}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      on:input={handleInput}
    ></textarea>
  {:else}
    <input
      {id}
      {type}
      bind:this={inputElement}
      {value}
      {placeholder}
      {disabled}
      {required}
      class="field__input"
      class:field__input--error={!!error}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      on:input={handleInput}
    />
  {/if}

  {#if error}
    <div class="field__error" id="{id}-error" role="alert">
      {error}
    </div>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .field__label {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
  }

  .field__required {
    color: var(--error);
    margin-left: var(--space-1);
  }

  .field__input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    transition: all var(--transition);
  }

  .field__input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-dark);
  }

  .field__input:disabled {
    background-color: var(--bg-secondary);
    cursor: not-allowed;
  }

  .field__input--error {
    border-color: var(--error);
  }

  .field__input--error:focus {
    box-shadow: 0 0 0 2px var(--error-dark);
  }

  .field__error {
    color: var(--error);
    font-size: var(--font-size-sm);
  }

  textarea.field__input {
    resize: vertical;
    min-height: calc(var(--space-4) * 3);
  }
</style>
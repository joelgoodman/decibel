<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let value: {
    text: string;
    format: 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3';
  };
  export let readOnly = false;

  const dispatch = createEventDispatcher();
  let editor: HTMLElement;

  $: tag = {
    'paragraph': 'p',
    'heading-1': 'h1',
    'heading-2': 'h2',
    'heading-3': 'h3'
  }[value.format];

  onMount(() => {
    if (!readOnly) {
      editor.contentEditable = 'true';
      editor.addEventListener('input', handleInput);
      editor.addEventListener('keydown', handleKeydown);
    }

    return () => {
      if (!readOnly) {
        editor.removeEventListener('input', handleInput);
        editor.removeEventListener('keydown', handleKeydown);
      }
    };
  });

  function handleInput() {
    const text = editor.innerHTML;
    dispatch('change', { ...value, text });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      dispatch('enter');
    }
  }
</script>

<svelte:element 
  this={tag}
  bind:this={editor}
  class="text-block"
  class:text-block--readonly={readOnly}
>
  {@html value.text}
</svelte:element>

<style>
  .text-block {
    width: 100%;
    min-height: 1.5em;
    outline: none;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    transition: background-color var(--transition);
  }

  .text-block:not(.text-block--readonly):hover {
    background-color: var(--bg-secondary);
  }

  .text-block:focus {
    background-color: var(--bg-secondary);
  }

  h1 {
    font-size: var(--font-size-3xl);
    font-weight: 700;
  }

  h2 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  h3 {
    font-size: var(--font-size-xl);
    font-weight: 600;
  }

  p {
    font-size: var(--font-size-base);
    line-height: 1.6;
  }
</style>
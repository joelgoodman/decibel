<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { useDraggable } from '@dnd-kit/core';
  import type { Block } from '../../types/editor';
  import TextBlock from './blocks/TextBlock.svelte';
  import ImageBlock from './blocks/ImageBlock.svelte';
  import GalleryBlock from './blocks/GalleryBlock.svelte';
  import EmbedBlock from './blocks/EmbedBlock.svelte';
  import SeparatorBlock from './blocks/SeparatorBlock.svelte';
  import CalloutBlock from './blocks/CalloutBlock.svelte';
  import PullquoteBlock from './blocks/PullquoteBlock.svelte';
  import HiddenBlock from './blocks/HiddenBlock.svelte';
  import CodeBlock from './blocks/CodeBlock.svelte';
  import TableBlock from './blocks/TableBlock.svelte';
  import BlockControls from './BlockControls.svelte';
  import ErrorBoundary from '../error/ErrorBoundary.svelte';

  export let block: Block;
  export let index: number;
  export let selected = false;
  export let readOnly = false;

  const dispatch = createEventDispatcher();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
    disabled: readOnly
  });

  $: style = transform ? `
    transform: translate3d(${transform.x}px, ${transform.y}px, 0);
    z-index: 1;
  ` : undefined;

  function handleError(error: Error) {
    console.error(`Error in block ${block.id}:`, error);
    // You could dispatch an event here to notify parent components
  }
</script>

<div
  class="block-wrapper"
  class:selected
  {style}
  data-block-id={block.id}
  data-block-type={block.type}
  on:click={() => dispatch('select')}
  bind:this={setNodeRef}
  {...attributes}
  {...listeners}
>
  {#if !readOnly}
    <BlockControls
      {index}
      type={block.type}
      on:delete
      on:duplicate
      on:transform
    />
  {/if}

  <div class="block">
    <ErrorBoundary on:error={handleError}>
      {#if block.type === 'text'}
        <TextBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'image'}
        <ImageBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'gallery'}
        <GalleryBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'embed'}
        <EmbedBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'separator'}
        <SeparatorBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'callout'}
        <CalloutBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'pullquote'}
        <PullquoteBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'hidden'}
        <HiddenBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'code'}
        <CodeBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {:else if block.type === 'table'}
        <TableBlock
          value={block.data}
          {readOnly}
          on:change={(e) => dispatch('change', e.detail)}
        />
      {/if}
    </ErrorBoundary>
  </div>
</div>

<style>
  .block-wrapper {
    position: relative;
    display: flex;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    transition: background-color var(--transition);
  }

  .block-wrapper:hover {
    background-color: var(--bg-secondary);
  }

  .block-wrapper.selected {
    background-color: var(--bg-secondary);
    box-shadow: 0 0 0 2px var(--primary);
  }

  .block {
    flex: 1;
    min-width: 0;
  }
</style>
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { DndContext, DragOverlay } from '@dnd-kit/core';
  import type { Block, BlockType } from '../../types/editor';
  import { generateBlockId } from '../../utils/editor';
  import BlockWrapper from './BlockWrapper.svelte';
  import BlockControls from './BlockControls.svelte';
  import AddBlockButton from './AddBlockButton.svelte';
  import Toolbar from './Toolbar.svelte';
  import { undoManager } from '../../stores/undoManager';
  import { auth } from '../../stores/auth';

  export let blocks: Block[] = [];
  export let readOnly = false;
  export let showToolbar = true;

  const dispatch = createEventDispatcher<{
    change: { blocks: Block[] };
  }>();

  let activeId: string | null = null;
  let selectedBlockId: string | null = null;

  $: visibleBlocks = blocks.filter(block => {
    if (!block.meta?.roles?.length) return true;
    return block.meta.roles.some(role => $auth.user?.roles.includes(role));
  });

  onMount(() => {
    // Initialize undo/redo history
    undoManager.clear();
    undoManager.add(blocks);

    // Handle keyboard shortcuts
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          undoManager.redo();
        } else {
          undoManager.undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  });

  function handleBlockChange(index: number, data: any) {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], data };
    updateBlocks(updatedBlocks);
  }

  function handleAddBlock(type: BlockType) {
    const newBlock: Block = {
      id: generateBlockId(),
      type,
      data: getInitialBlockData(type)
    };
    
    const updatedBlocks = [...blocks, newBlock];
    updateBlocks(updatedBlocks);
    selectedBlockId = newBlock.id;
  }

  function handleDragStart(event: any) {
    activeId = event.active.id;
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      
      const updatedBlocks = [...blocks];
      const [movedBlock] = updatedBlocks.splice(oldIndex, 1);
      updatedBlocks.splice(newIndex, 0, movedBlock);
      
      updateBlocks(updatedBlocks);
    }
    
    activeId = null;
  }

  function updateBlocks(newBlocks: Block[]) {
    undoManager.add(newBlocks);
    dispatch('change', { blocks: newBlocks });
  }

  function handleUndo() {
    const previousBlocks = undoManager.undo();
    if (previousBlocks) {
      dispatch('change', { blocks: previousBlocks });
    }
  }

  function handleRedo() {
    const nextBlocks = undoManager.redo();
    if (nextBlocks) {
      dispatch('change', { blocks: nextBlocks });
    }
  }
</script>

<div class="block-editor">
  {#if showToolbar && !readOnly}
    <Toolbar
      selectedBlockId={selectedBlockId}
      canUndo={undoManager.canUndo()}
      canRedo={undoManager.canRedo()}
      on:undo={handleUndo}
      on:redo={handleRedo}
    />
  {/if}

  {#if blocks.length === 0}
    <div class="empty-state">
      <p>Start writing or add a block</p>
      <AddBlockButton onAdd={handleAddBlock} />
    </div>
  {:else}
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      disabled={readOnly}
    >
      <div class="blocks">
        {#each visibleBlocks as block, index (block.id)}
          <BlockWrapper
            {block}
            {index}
            selected={selectedBlockId === block.id}
            {readOnly}
            on:select={() => selectedBlockId = block.id}
            on:change={(e) => handleBlockChange(index, e.detail)}
          />
        {/each}
      </div>

      <DragOverlay>
        {#if activeId}
          <div class="block-overlay">
            {blocks.find(b => b.id === activeId)?.data?.title || 'Block'}
          </div>
        {/if}
      </DragOverlay>
    </DndContext>

    {#if !readOnly}
      <AddBlockButton onAdd={handleAddBlock} />
    {/if}
  {/if}
</div>

<style>
  .block-editor {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .empty-state {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    color: var(--text-secondary);
  }

  .empty-state p {
    margin-bottom: var(--space-4);
  }

  .blocks {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .block-overlay {
    padding: var(--space-2) var(--space-4);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    opacity: 0.8;
  }
</style>
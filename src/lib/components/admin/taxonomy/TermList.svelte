<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { useSortable } from '@dnd-kit/sortable';
  import { CSS } from '@dnd-kit/utilities';
  import Button from '../../common/Button.svelte';

  export let terms = [];

  const dispatch = createEventDispatcher();

  function SortableItem(node: HTMLElement, id: string) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id });

    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });

    Object.entries(listeners).forEach(([event, handler]) => {
      node.addEventListener(event, handler);
    });

    setNodeRef(node);

    node.style.transform = CSS.Transform.toString(transform);
    node.style.transition = transition;

    return {
      destroy() {
        Object.entries(listeners).forEach(([event, handler]) => {
          node.removeEventListener(event, handler);
        });
      }
    };
  }
</script>

<div class="term-list">
  {#each terms as term (term.id)}
    <div 
      class="term-item"
      use:SortableItem={term.id}
    >
      <div class="term-content">
        <div class="drag-handle">⋮⋮</div>
        <div class="term-info">
          <h3>{term.name}</h3>
          {#if term.description}
            <p class="description">{term.description}</p>
          {/if}
          {#if term.count !== undefined}
            <span class="count">{term.count} items</span>
          {/if}
        </div>
        <div class="actions">
          <Button
            variant="secondary"
            size="sm"
            on:click={() => dispatch('select', term.id)}
          >
            Edit
          </Button>
        </div>
      </div>

      {#if term.children?.length}
        <div class="term-children">
          {#each term.children as child (child.id)}
            <div 
              class="term-item"
              use:SortableItem={child.id}
            >
              <div class="term-content">
                <div class="drag-handle">⋮⋮</div>
                <div class="term-info">
                  <h3>{child.name}</h3>
                  {#if child.description}
                    <p class="description">{child.description}</p>
                  {/if}
                  {#if child.count !== undefined}
                    <span class="count">{child.count} items</span>
                  {/if}
                </div>
                <div class="actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    on:click={() => dispatch('select', child.id)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .term-list {
    padding: var(--space-4);
  }

  .term-item {
    margin-bottom: var(--space-2);
  }

  .term-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    transition: background-color var(--transition);
  }

  .term-content:hover {
    background: var(--bg-tertiary);
  }

  .drag-handle {
    color: var(--text-secondary);
    cursor: move;
    user-select: none;
  }

  .term-info {
    flex: 1;
    min-width: 0;
  }

  h3 {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: 500;
  }

  .description {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .count {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .term-children {
    margin-left: var(--space-8);
    margin-top: var(--space-2);
  }
</style>
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';
  import Button from '../../common/Button.svelte';

  export let items = [];
  export let total = 0;
  export let filters = {
    page: 1,
    limit: 20
  };

  const dispatch = createEventDispatcher();

  $: totalPages = Math.ceil(total / filters.limit);
  $: hierarchicalItems = buildHierarchy(items);

  function buildHierarchy(items) {
    const itemMap = new Map();
    const roots = [];

    // Create map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build tree structure
    items.forEach(item => {
      const node = itemMap.get(item.id);
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
</script>

<div class="taxonomy-list">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Items</th>
        <th>Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each hierarchicalItems as item}
        <tr>
          <td>
            <div class="taxonomy-name">
              <span>{item.name}</span>
              {#if item.description}
                <span class="description">{item.description}</span>
              {/if}
            </div>
          </td>
          <td>
            <span class="type">{item.type}</span>
          </td>
          <td>{item.itemCount || 0}</td>
          <td>
            <time datetime={item.updatedAt}>
              {format(new Date(item.updatedAt), 'MMM d, yyyy')}
            </time>
          </td>
          <td>
            <div class="actions">
              <Button 
                variant="secondary" 
                size="sm"
                href={`/admin/taxonomies/${item.id}`}
              >
                Edit
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                href={`/admin/taxonomies/${item.id}/terms`}
              >
                Terms
              </Button>
            </div>
          </td>
        </tr>
        {#if item.children?.length}
          {#each item.children as child}
            <tr class="child-row">
              <td>
                <div class="taxonomy-name taxonomy-name--child">
                  <span>{child.name}</span>
                  {#if child.description}
                    <span class="description">{child.description}</span>
                  {/if}
                </div>
              </td>
              <td>
                <span class="type">{child.type}</span>
              </td>
              <td>{child.itemCount || 0}</td>
              <td>
                <time datetime={child.updatedAt}>
                  {format(new Date(child.updatedAt), 'MMM d, yyyy')}
                </time>
              </td>
              <td>
                <div class="actions">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    href={`/admin/taxonomies/${child.id}`}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    href={`/admin/taxonomies/${child.id}/terms`}
                  >
                    Terms
                  </Button>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      {/each}
    </tbody>
  </table>

  {#if totalPages > 1}
    <div class="pagination">
      <Button
        variant="secondary"
        size="sm"
        disabled={filters.page === 1}
        on:click={() => dispatch('pageChange', filters.page - 1)}
      >
        Previous
      </Button>

      <span class="page-info">
        Page {filters.page} of {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={filters.page === totalPages}
        on:click={() => dispatch('pageChange', filters.page + 1)}
      >
        Next
      </Button>
    </div>
  {/if}
</div>

<style>
  .taxonomy-list {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: var(--space-4);
    text-align: left;
    border-bottom: 1px solid var(--border-primary);
  }

  th {
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
  }

  .taxonomy-name {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .taxonomy-name--child {
    padding-left: var(--space-6);
    position: relative;
  }

  .taxonomy-name--child::before {
    content: '';
    position: absolute;
    left: var(--space-2);
    top: 50%;
    width: var(--space-3);
    height: 1px;
    background-color: var(--border-primary);
  }

  .description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .type {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-4);
    border-top: 1px solid var(--border-primary);
  }

  .page-info {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';
  import Badge from '../common/Badge.svelte';
  import Button from '../common/Button.svelte';

  export let items = [];
  export let total = 0;
  export let filters = {
    page: 1,
    limit: 10
  };

  const dispatch = createEventDispatcher();

  function getStatusVariant(status: string) {
    switch (status.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'scheduled': return 'info';
      case 'archived': return 'error';
      default: return 'default';
    }
  }

  $: totalPages = Math.ceil(total / filters.limit);
</script>

<div class="content-list">
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Type</th>
        <th>Status</th>
        <th>Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item}
        <tr>
          <td>{item.title}</td>
          <td>
            <span class="type">{item.type}</span>
          </td>
          <td>
            <Badge variant={getStatusVariant(item.status)} size="sm">
              {item.status}
            </Badge>
          </td>
          <td>
            <time datetime={item.updated_at}>
              {format(new Date(item.updated_at), 'MMM d, yyyy')}
            </time>
          </td>
          <td>
            <div class="actions">
              <Button 
                variant="secondary" 
                size="sm"
                href={`/admin/content/${item.id}`}
              >
                Edit
              </Button>
            </div>
          </td>
        </tr>
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
  .content-list {
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
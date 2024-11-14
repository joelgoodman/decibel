<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';
  import Badge from '../../common/Badge.svelte';
  import Button from '../../common/Button.svelte';

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

<div class="page-list">
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>URL</th>
        <th>Status</th>
        <th>Last Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each items as page}
        <tr>
          <td>
            <div class="page-info">
              <span class="title">{page.title}</span>
              {#if page.description}
                <span class="description">{page.description}</span>
              {/if}
            </div>
          </td>
          <td>
            <span class="url">/{page.slug}</span>
          </td>
          <td>
            <Badge variant={getStatusVariant(page.status)} size="sm">
              {page.status}
            </Badge>
          </td>
          <td>
            <time datetime={page.updatedAt}>
              {format(new Date(page.updatedAt), 'MMM d, yyyy')}
            </time>
          </td>
          <td>
            <div class="actions">
              <Button 
                variant="secondary" 
                size="sm"
                href={`/admin/pages/${page.id}`}
              >
                Edit
              </Button>
              {#if page.status === 'published'}
                <Button 
                  variant="secondary" 
                  size="sm"
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </Button>
              {/if}
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
  .page-list {
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

  .page-info {
    display: flex;
    flex-direction: column;
  }

  .title {
    font-weight: 500;
  }

  .description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-top: var(--space-1);
  }

  .url {
    font-family: var(--font-mono);
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
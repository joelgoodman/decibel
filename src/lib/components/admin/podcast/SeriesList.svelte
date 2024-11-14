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

<div class="series-list">
  <div class="grid">
    {#each items as series}
      <div class="series-card">
        <div class="cover">
          {#if series.coverImage}
            <img src={series.coverImage} alt={series.title} />
          {:else}
            <div class="cover-placeholder">
              <span>No Cover</span>
            </div>
          {/if}
        </div>

        <div class="content">
          <div class="header">
            <h2>{series.title}</h2>
            <Badge variant={getStatusVariant(series.status)} size="sm">
              {series.status}
            </Badge>
          </div>

          {#if series.description}
            <p class="description">{series.description}</p>
          {/if}

          <div class="meta">
            <span>{series.episodeCount || 0} episodes</span>
            <time datetime={series.updatedAt}>
              Updated {format(new Date(series.updatedAt), 'MMM d, yyyy')}
            </time>
          </div>

          <div class="actions">
            <Button 
              variant="secondary" 
              size="sm"
              href={`/admin/podcast/series/${series.id}`}
            >
              Edit
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              href={`/admin/podcast/series/${series.id}/episodes`}
            >
              Episodes
            </Button>
          </div>
        </div>
      </div>
    {/each}
  </div>

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
  .series-list {
    padding: var(--space-4);
  }

  .grid {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .series-card {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: transform var(--transition);
  }

  .series-card:hover {
    transform: translateY(-2px);
  }

  .cover {
    aspect-ratio: 16/9;
    background: var(--bg-tertiary);
  }

  .cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .content {
    padding: var(--space-4);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  h2 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: 0;
  }

  .description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin: 0 0 var(--space-4);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-4);
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
    margin-top: var(--space-4);
  }

  .page-info {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
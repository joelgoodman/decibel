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

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  $: totalPages = Math.ceil(total / filters.limit);
</script>

<div class="episode-list">
  <table>
    <thead>
      <tr>
        <th>Episode</th>
        <th>Duration</th>
        <th>Status</th>
        <th>Published</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each items as episode}
        <tr>
          <td>
            <div class="episode-info">
              <span class="episode-number">#{episode.episodeNumber || '—'}</span>
              <div class="episode-details">
                <span class="title">{episode.title}</span>
                {#if episode.description}
                  <span class="description">{episode.description}</span>
                {/if}
              </div>
            </div>
          </td>
          <td>
            {#if episode.duration}
              <span class="duration">{formatDuration(episode.duration)}</span>
            {:else}
              —
            {/if}
          </td>
          <td>
            <Badge variant={getStatusVariant(episode.status)} size="sm">
              {episode.status}
            </Badge>
          </td>
          <td>
            {#if episode.publishedAt}
              <time datetime={episode.publishedAt}>
                {format(new Date(episode.publishedAt), 'MMM d, yyyy')}
              </time>
            {:else}
              —
            {/if}
          </td>
          <td>
            <div class="actions">
              <Button 
                variant="secondary" 
                size="sm"
                href={`/admin/podcast/episodes/${episode.id}`}
              >
                Edit
              </Button>
              {#if episode.status === 'published'}
                <Button 
                  variant="secondary" 
                  size="sm"
                  href={episode.url}
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
  .episode-list {
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

  .episode-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .episode-number {
    font-family: var(--font-mono);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  .episode-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .title {
    font-weight: 500;
  }

  .description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .duration {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
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
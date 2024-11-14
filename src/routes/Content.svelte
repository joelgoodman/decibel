<script lang="ts">
  import { usePaginatedQuery } from '../lib/hooks/useQuery';
  import { api } from '../lib/services/api';
  import ContentSearch from '../lib/components/search/ContentSearch.svelte';
  import Card from '../lib/components/common/Card.svelte';
  import Badge from '../lib/components/common/Badge.svelte';
  import LoadingSpinner from '../lib/components/common/LoadingSpinner.svelte';
  import Button from '../lib/components/common/Button.svelte';
  import { format } from 'date-fns';

  let searchQuery = '';
  let page = 1;
  let limit = 10;

  $: queryParams = {
    query: searchQuery,
    page,
    limit
  };

  const content = usePaginatedQuery({
    queryKey: ['content', queryParams],
    queryFn: () => api.getContent(queryParams),
    page,
    limit
  });

  function handleSearch({ detail }: CustomEvent<{ query: string }>) {
    searchQuery = detail.query;
    page = 1; // Reset to first page on new search
  }

  function getStatusVariant(status: string) {
    switch (status.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'scheduled': return 'info';
      case 'archived': return 'error';
      default: return 'default';
    }
  }
</script>

<div class="content-page">
  <div class="header">
    <h1>Content</h1>
    <Button variant="primary" href="/content/new">New Content</Button>
  </div>

  <div class="search-bar">
    <ContentSearch on:search={handleSearch} />
  </div>

  {#if $content.isLoading}
    <div class="loading">
      <LoadingSpinner />
    </div>
  {:else if $content.error}
    <div class="error">
      {$content.error instanceof Error ? $content.error.message : 'Error loading content'}
    </div>
  {:else if $content.data.content.length === 0}
    <div class="empty">
      <p>No content found</p>
      {#if searchQuery}
        <p class="empty-search">Try adjusting your search terms</p>
      {/if}
    </div>
  {:else}
    <div class="content-grid">
      {#each $content.data.content as item}
        <Card variant="outline">
          <div class="content-item">
            <div class="content-header">
              <h2>{item.title}</h2>
              <Badge
                variant={getStatusVariant(item.status)}
                size="sm"
              >
                {item.status}
              </Badge>
            </div>
            
            <div class="content-meta">
              <span class="date">
                {format(new Date(item.updated_at), 'MMM d, yyyy')}
              </span>
              <span class="type">{item.type}</span>
            </div>

            <div class="content-actions">
              <Button
                variant="secondary"
                size="sm"
                href={`/content/${item.id}`}
              >
                Edit
              </Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>

    {#if $content.data.total > limit}
      <div class="pagination">
        <Button
          variant="secondary"
          disabled={page === 1}
          on:click={() => page--}
        >
          Previous
        </Button>
        
        <span class="page-info">
          Page {page} of {Math.ceil($content.data.total / limit)}
        </span>
        
        <Button
          variant="secondary"
          disabled={page * limit >= $content.data.total}
          on:click={() => page++}
        >
          Next
        </Button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .content-page {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  .search-bar {
    margin-bottom: var(--space-6);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }

  .error {
    color: var(--error);
    padding: var(--space-4);
    text-align: center;
  }

  .empty {
    text-align: center;
    padding: var(--space-8);
    color: var(--text-secondary);
  }

  .empty-search {
    font-size: var(--font-size-sm);
    margin-top: var(--space-2);
  }

  .content-grid {
    display: grid;
    gap: var(--space-4);
  }

  @media (min-width: 640px) {
    .content-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .content-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .content-item {
    padding: var(--space-4);
  }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-2);
  }

  .content-header h2 {
    font-size: var(--font-size-lg);
    font-weight: 500;
    margin-right: var(--space-2);
  }

  .content-meta {
    display: flex;
    gap: var(--space-2);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-4);
  }

  .content-actions {
    display: flex;
    justify-content: flex-end;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-8);
  }

  .page-info {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import EpisodeList from '../../lib/components/admin/podcast/EpisodeList.svelte';
  import EpisodeFilters from '../../lib/components/admin/podcast/EpisodeFilters.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  export let seriesId: string;

  let filters = {
    search: '',
    status: 'all',
    page: 1,
    limit: 10
  };

  $: queryParams = {
    ...filters,
    type: 'podcast',
    status: filters.status === 'all' ? undefined : filters.status,
    seriesId
  };

  const seriesQuery = useQuery({
    queryKey: ['podcast-series', seriesId],
    queryFn: () => api.getContentById(seriesId)
  });

  const episodesQuery = useQuery({
    queryKey: ['podcast-episodes', queryParams],
    queryFn: () => api.getContent(queryParams)
  });

  function handleFilterChange(event: CustomEvent) {
    filters = { ...filters, ...event.detail, page: 1 };
  }

  function handlePageChange(page: number) {
    filters = { ...filters, page };
  }
</script>

<div class="episodes-page">
  <header class="header">
    <div class="header-content">
      <div class="title">
        <h1>Episodes</h1>
        {#if $seriesQuery.data}
          <span class="series-name">
            {$seriesQuery.data.title}
          </span>
        {/if}
      </div>
      <Button 
        href={`/admin/podcast/series/${seriesId}/episodes/new`} 
        variant="primary"
      >
        New Episode
      </Button>
    </div>
    <EpisodeFilters on:change={handleFilterChange} />
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $episodesQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $episodesQuery.data}
        <EpisodeList 
          items={$episodesQuery.data.content}
          total={$episodesQuery.data.total}
          {filters}
          on:pageChange={(e) => handlePageChange(e.detail)}
        />
      {/if}
    </QueryErrorBoundary>
  </main>
</div>

<style>
  .episodes-page {
    padding: var(--space-6);
  }

  .header {
    margin-bottom: var(--space-6);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .title {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  .series-name {
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
  }

  .main {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }
</style>
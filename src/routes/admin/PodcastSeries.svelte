<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import SeriesList from '../../lib/components/admin/podcast/SeriesList.svelte';
  import SeriesFilters from '../../lib/components/admin/podcast/SeriesFilters.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  let filters = {
    search: '',
    status: 'all',
    page: 1,
    limit: 10
  };

  $: queryParams = {
    ...filters,
    type: 'series',
    status: filters.status === 'all' ? undefined : filters.status
  };

  const seriesQuery = useQuery({
    queryKey: ['podcast-series', queryParams],
    queryFn: () => api.getContent(queryParams)
  });

  function handleFilterChange(event: CustomEvent) {
    filters = { ...filters, ...event.detail, page: 1 };
  }

  function handlePageChange(page: number) {
    filters = { ...filters, page };
  }
</script>

<div class="series-page">
  <header class="header">
    <div class="header-content">
      <h1>Podcast Series</h1>
      <Button href="/admin/podcast/series/new" variant="primary">Create New Series</Button>
    </div>
    <SeriesFilters on:change={handleFilterChange} />
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $seriesQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $seriesQuery.data}
        <SeriesList 
          items={$seriesQuery.data.content}
          total={$seriesQuery.data.total}
          {filters}
          on:pageChange={(e) => handlePageChange(e.detail)}
        />
      {/if}
    </QueryErrorBoundary>
  </main>
</div>

<style>
  .series-page {
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

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
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
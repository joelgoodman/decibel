<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import PageList from '../../lib/components/admin/pages/PageList.svelte';
  import PageFilters from '../../lib/components/admin/pages/PageFilters.svelte';
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
    type: 'page',
    status: filters.status === 'all' ? undefined : filters.status
  };

  const pagesQuery = useQuery({
    queryKey: ['pages', queryParams],
    queryFn: () => api.getContent(queryParams)
  });

  function handleFilterChange(event: CustomEvent) {
    filters = { ...filters, ...event.detail, page: 1 };
  }

  function handlePageChange(page: number) {
    filters = { ...filters, page };
  }
</script>

<div class="pages-page">
  <header class="header">
    <div class="header-content">
      <h1>Pages</h1>
      <Button href="/admin/pages/new" variant="primary">Create Page</Button>
    </div>
    <PageFilters on:change={handleFilterChange} />
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $pagesQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $pagesQuery.data}
        <PageList 
          items={$pagesQuery.data.content}
          total={$pagesQuery.data.total}
          {filters}
          on:pageChange={(e) => handlePageChange(e.detail)}
        />
      {/if}
    </QueryErrorBoundary>
  </main>
</div>

<style>
  .pages-page {
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
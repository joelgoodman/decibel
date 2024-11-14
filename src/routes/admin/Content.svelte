<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import ContentList from '../../lib/components/admin/ContentList.svelte';
  import ContentFilters from '../../lib/components/admin/ContentFilters.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  let filters = {
    type: 'all',
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  };

  $: queryParams = {
    ...filters,
    type: filters.type === 'all' ? undefined : filters.type,
    status: filters.status === 'all' ? undefined : filters.status
  };

  const contentQuery = useQuery({
    queryKey: ['content', queryParams],
    queryFn: () => api.getContent(queryParams)
  });

  function handleFilterChange(event: CustomEvent) {
    filters = { ...filters, ...event.detail, page: 1 };
  }

  function handlePageChange(page: number) {
    filters = { ...filters, page };
  }
</script>

<div class="content-page">
  <header class="header">
    <div class="header-content">
      <h1>Content</h1>
      <Button href="/admin/content/new" variant="primary">Create New</Button>
    </div>
    <ContentFilters on:change={handleFilterChange} />
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $contentQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $contentQuery.data}
        <ContentList 
          items={$contentQuery.data.content}
          total={$contentQuery.data.total}
          {filters}
          on:pageChange={(e) => handlePageChange(e.detail)}
        />
      {/if}
    </QueryErrorBoundary>
  </main>
</div>

<style>
  .content-page {
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
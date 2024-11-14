<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import TaxonomyList from '../../lib/components/admin/taxonomy/TaxonomyList.svelte';
  import TaxonomyFilters from '../../lib/components/admin/taxonomy/TaxonomyFilters.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  let filters = {
    type: 'all',
    search: '',
    page: 1,
    limit: 20
  };

  $: queryParams = {
    ...filters,
    type: filters.type === 'all' ? undefined : filters.type
  };

  const taxonomiesQuery = useQuery({
    queryKey: ['taxonomies', queryParams],
    queryFn: () => api.getTaxonomies(queryParams)
  });

  function handleFilterChange(event: CustomEvent) {
    filters = { ...filters, ...event.detail, page: 1 };
  }

  function handlePageChange(page: number) {
    filters = { ...filters, page };
  }
</script>

<div class="taxonomies-page">
  <header class="header">
    <div class="header-content">
      <h1>Taxonomies</h1>
      <Button href="/admin/taxonomies/new" variant="primary">Create New</Button>
    </div>
    <TaxonomyFilters on:change={handleFilterChange} />
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $taxonomiesQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $taxonomiesQuery.data}
        <TaxonomyList 
          items={$taxonomiesQuery.data.taxonomies}
          total={$taxonomiesQuery.data.total}
          {filters}
          on:pageChange={(e) => handlePageChange(e.detail)}
        />
      {/if}
    </QueryErrorBoundary>
  </main>
</div>

<style>
  .taxonomies-page {
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
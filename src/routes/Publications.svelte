<script lang="ts">
  import { usePaginatedQuery } from '../lib/hooks/useQuery';
  import { api } from '../lib/services/api';
  import LoadingSpinner from '../lib/components/common/LoadingSpinner.svelte';
  import Button from '../lib/components/common/Button.svelte';
  import Card from '../lib/components/common/Card.svelte';

  let page = 1;
  let limit = 10;

  const publications = usePaginatedQuery({
    queryKey: ['publications'],
    queryFn: () => api.getPublications({ page, limit }),
    page,
    limit
  });
</script>

<div class="container">
  <div class="header">
    <h1>Publications</h1>
    <Button variant="primary">New Publication</Button>
  </div>

  {#if $publications.isLoading}
    <div class="loading">
      <LoadingSpinner />
    </div>
  {:else if $publications.error}
    <div class="error">
      {$publications.error instanceof Error ? $publications.error.message : 'Error loading publications'}
    </div>
  {:else}
    <div class="grid">
      {#each $publications.data.publications as publication}
        <Card>
          <h2>{publication.title}</h2>
          {#if publication.description}
            <p class="description">{publication.description}</p>
          {/if}
          <div class="actions">
            <Button variant="secondary">View</Button>
          </div>
        </Card>
      {/each}
    </div>

    {#if $publications.data.total > limit}
      <div class="pagination">
        <Button 
          variant="secondary"
          disabled={page === 1}
          on:click={() => page--}
        >
          Previous
        </Button>
        <Button 
          variant="secondary"
          disabled={page * limit >= $publications.data.total}
          on:click={() => page++}
        >
          Next
        </Button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-8) var(--spacing-4);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-8);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--spacing-8) 0;
  }

  .error {
    color: var(--error);
    padding: var(--spacing-4);
  }

  .grid {
    display: grid;
    gap: var(--spacing-6);
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: var(--spacing-2);
  }

  .description {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-4);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: var(--spacing-2);
    margin-top: var(--spacing-8);
  }
</style>
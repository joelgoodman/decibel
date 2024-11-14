<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../../lib/services/api';
  import Button from '../../common/Button.svelte';
  import LoadingSpinner from '../../common/LoadingSpinner.svelte';
  import Badge from '../../common/Badge.svelte';

  export let contentId: string;
  export let taxonomyType: string;

  const dispatch = createEventDispatcher();
  let selectedTerms: string[] = [];
  let searchQuery = '';

  const contentTaxonomiesQuery = useQuery({
    queryKey: ['content-taxonomies', contentId, taxonomyType],
    queryFn: () => api.getContentTaxonomies(contentId, taxonomyType)
  });

  const availableTermsQuery = useQuery({
    queryKey: ['taxonomy-terms', taxonomyType, searchQuery],
    queryFn: () => api.searchTaxonomyTerms(taxonomyType, searchQuery)
  });

  const updateMutation = useMutation({
    mutationFn: (termIds: string[]) => 
      api.updateContentTaxonomies(contentId, taxonomyType, termIds),
    onSuccess: () => {
      contentTaxonomiesQuery.refetch();
      dispatch('change');
    }
  });

  $: if ($contentTaxonomiesQuery.data) {
    selectedTerms = $contentTaxonomiesQuery.data.map(t => t.id);
  }

  function handleTermToggle(termId: string) {
    const isSelected = selectedTerms.includes(termId);
    const newSelection = isSelected
      ? selectedTerms.filter(id => id !== termId)
      : [...selectedTerms, termId];
    
    updateMutation.mutate(newSelection);
  }

  function handleSearch(event: Event) {
    searchQuery = (event.target as HTMLInputElement).value;
  }
</script>

<div class="taxonomy-manager">
  <div class="header">
    <h3>Manage {taxonomyType}s</h3>
    <div class="search">
      <input
        type="text"
        placeholder="Search terms..."
        value={searchQuery}
        on:input={handleSearch}
      />
    </div>
  </div>

  <div class="content">
    {#if $contentTaxonomiesQuery.isLoading || $availableTermsQuery.isLoading}
      <div class="loading">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="selected-terms">
        <h4>Selected {taxonomyType}s</h4>
        {#if selectedTerms.length === 0}
          <p class="empty">No {taxonomyType}s selected</p>
        {:else}
          <div class="term-list">
            {#each $contentTaxonomiesQuery.data as term}
              <div class="term-item">
                <Badge variant="primary">
                  {term.name}
                  <button
                    class="remove-button"
                    on:click={() => handleTermToggle(term.id)}
                  >
                    ×
                  </button>
                </Badge>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="available-terms">
        <h4>Available {taxonomyType}s</h4>
        {#if $availableTermsQuery.data?.length === 0}
          <p class="empty">No {taxonomyType}s found</p>
        {:else}
          <div class="term-list">
            {#each $availableTermsQuery.data || [] as term}
              {#if !selectedTerms.includes(term.id)}
                <div class="term-item">
                  <Button
                    variant="secondary"
                    size="sm"
                    on:click={() => handleTermToggle(term.id)}
                  >
                    {term.name}
                  </Button>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .taxonomy-manager {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: 0;
  }

  .search input {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  h4 {
    font-size: var(--font-size-base);
    font-weight: 500;
    margin: 0 0 var(--space-2);
    color: var(--text-secondary);
  }

  .term-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .empty {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-style: italic;
  }

  .remove-button {
    background: none;
    border: none;
    color: inherit;
    margin-left: var(--space-1);
    padding: 0 var(--space-1);
    cursor: pointer;
    opacity: 0.7;
  }

  .remove-button:hover {
    opacity: 1;
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }
</style>
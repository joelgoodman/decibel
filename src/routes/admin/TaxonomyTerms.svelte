<script lang="ts">
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { DndContext, closestCenter } from '@dnd-kit/core';
  import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
  import TermList from '../../lib/components/admin/taxonomy/TermList.svelte';
  import TermForm from '../../lib/components/admin/taxonomy/TermForm.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  export let id: string;

  let selectedTermId: string | null = null;
  let showForm = false;

  const taxonomyQuery = useQuery({
    queryKey: ['taxonomy', id],
    queryFn: () => api.getTaxonomyById(id)
  });

  const termsQuery = useQuery({
    queryKey: ['taxonomy-terms', id],
    queryFn: () => api.getTaxonomyTerms(id)
  });

  const reorderMutation = useMutation({
    mutationFn: (updates: { id: string; order: number }[]) =>
      api.reorderTaxonomyTerms(id, updates),
    onSuccess: () => {
      termsQuery.refetch();
    }
  });

  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = $termsQuery.data.findIndex(t => t.id === active.id);
      const newIndex = $termsQuery.data.findIndex(t => t.id === over.id);
      
      const updates = $termsQuery.data.map((term, i) => {
        if (i === oldIndex) return { id: term.id, order: newIndex };
        if (i === newIndex) return { id: term.id, order: oldIndex };
        return { id: term.id, order: i };
      });
      
      reorderMutation.mutate(updates);
    }
  }

  function handleTermSelect(termId: string) {
    selectedTermId = termId;
    showForm = true;
  }

  function handleFormClose() {
    selectedTermId = null;
    showForm = false;
  }

  function handleFormSuccess() {
    showForm = false;
    selectedTermId = null;
    termsQuery.refetch();
  }
</script>

<div class="terms-page">
  <header class="header">
    <div class="header-content">
      <div class="title">
        <h1>Terms</h1>
        {#if $taxonomyQuery.data}
          <span class="taxonomy-name">
            {$taxonomyQuery.data.name}
          </span>
        {/if}
      </div>
      <Button 
        variant="primary"
        on:click={() => {
          selectedTermId = null;
          showForm = true;
        }}
      >
        Add Term
      </Button>
    </div>
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $termsQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $termsQuery.data}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={$termsQuery.data}
            strategy={verticalListSortingStrategy}
          >
            <TermList
              terms={$termsQuery.data}
              on:select={e => handleTermSelect(e.detail)}
            />
          </SortableContext>
        </DndContext>
      {/if}
    </QueryErrorBoundary>
  </main>

  {#if showForm}
    <TermForm
      taxonomyId={id}
      termId={selectedTermId}
      on:close={handleFormClose}
      on:success={handleFormSuccess}
    />
  {/if}
</div>

<style>
  .terms-page {
    padding: var(--space-6);
  }

  .header {
    margin-bottom: var(--space-6);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .taxonomy-name {
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
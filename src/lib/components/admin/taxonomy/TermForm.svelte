<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../../lib/services/api';
  import Button from '../../common/Button.svelte';
  import TextField from '../../common/TextField.svelte';
  import LoadingSpinner from '../../common/LoadingSpinner.svelte';

  export let taxonomyId: string;
  export let termId: string | null = null;

  const dispatch = createEventDispatcher();

  let name = '';
  let description = '';
  let parentId = '';
  let slug = '';
  let saving = false;
  let error = '';

  const termQuery = useQuery({
    queryKey: ['taxonomy-term', termId],
    queryFn: () => api.getTaxonomyTerm(taxonomyId, termId!),
    enabled: !!termId
  });

  const parentsQuery = useQuery({
    queryKey: ['taxonomy-terms', taxonomyId],
    queryFn: () => api.getTaxonomyTerms(taxonomyId)
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return termId
        ? api.updateTaxonomyTerm(taxonomyId, termId, data)
        : api.createTaxonomyTerm(taxonomyId, data);
    },
    onSuccess: () => {
      dispatch('success');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save term';
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteTaxonomyTerm(taxonomyId, termId!),
    onSuccess: () => {
      dispatch('success');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to delete term';
    }
  });

  $: if ($termQuery.data) {
    name = $termQuery.data.name;
    description = $termQuery.data.description || '';
    parentId = $termQuery.data.parentId || '';
    slug = $termQuery.data.slug;
  }

  async function handleSave() {
    if (!name) {
      error = 'Name is required';
      return;
    }

    saving = true;
    error = '';

    try {
      await saveMutation.mutateAsync({
        name,
        description: description || undefined,
        parentId: parentId || undefined,
        slug: slug || undefined
      });
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this term?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
    } catch (err) {
      // Error is handled by mutation
    }
  }
</script>

<div class="modal-overlay">
  <div class="modal">
    <header class="modal-header">
      <h2>{termId ? 'Edit Term' : 'New Term'}</h2>
      <button class="close-button" on:click={() => dispatch('close')}>×</button>
    </header>

    {#if error}
      <div class="error">
        {error}
      </div>
    {/if}

    <div class="modal-content">
      {#if termId && $termQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else}
        <form class="form" on:submit|preventDefault={handleSave}>
          <TextField
            id="name"
            label="Name"
            bind:value={name}
            required
          />

          <TextField
            id="slug"
            label="Slug"
            bind:value={slug}
            placeholder="Optional - will be generated from name"
          />

          <div class="form-group">
            <label for="parent">Parent Term</label>
            <select id="parent" bind:value={parentId}>
              <option value="">None</option>
              {#if $parentsQuery.data}
                {#each $parentsQuery.data as term}
                  {#if term.id !== termId}
                    <option value={term.id}>{term.name}</option>
                  {/if}
                {/each}
              {/if}
            </select>
          </div>

          <TextField
            id="description"
            label="Description"
            bind:value={description}
            multiline
          />
        </form>
      {/if}
    </div>

    <footer class="modal-footer">
      {#if termId}
        <Button
          variant="error"
          on:click={handleDelete}
          disabled={saving || deleteMutation.isLoading}
        >
          {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      {/if}

      <div class="actions">
        <Button
          variant="secondary"
          on:click={() => dispatch('close')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          on:click={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </footer>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--border-primary);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-2);
    margin: calc(-1 * var(--space-2));
    border-radius: var(--radius-md);
  }

  .close-button:hover {
    background: var(--bg-secondary);
  }

  .error {
    margin: var(--space-4) var(--space-6) 0;
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
  }

  .modal-content {
    padding: var(--space-6);
    overflow-y: auto;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--border-primary);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }
</style>
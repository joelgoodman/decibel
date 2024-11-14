<script lang="ts">
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { navigate } from 'svelte-routing';
  import Button from '../../lib/components/common/Button.svelte';
  import TextField from '../../lib/components/common/TextField.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import ColorPicker from '../../lib/components/common/ColorPicker.svelte';

  export let id: string | undefined = undefined;

  let name = '';
  let type = 'category';
  let description = '';
  let parentId = '';
  let color = '#4f46e5';
  let icon = '';
  let saving = false;
  let error = '';

  const taxonomyQuery = useQuery({
    queryKey: ['taxonomy', id],
    queryFn: () => api.getTaxonomyById(id!),
    enabled: !!id
  });

  const parentTaxonomiesQuery = useQuery({
    queryKey: ['taxonomies', { type }],
    queryFn: () => api.getTaxonomies({ type })
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return id 
        ? api.updateTaxonomy(id, data)
        : api.createTaxonomy(data);
    },
    onSuccess: () => {
      navigate('/admin/taxonomies');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save taxonomy';
    }
  });

  $: if ($taxonomyQuery.data) {
    name = $taxonomyQuery.data.name;
    type = $taxonomyQuery.data.type;
    description = $taxonomyQuery.data.description || '';
    parentId = $taxonomyQuery.data.parentId || '';
    color = $taxonomyQuery.data.color || '#4f46e5';
    icon = $taxonomyQuery.data.icon || '';
  }

  async function handleSave() {
    if (!name || !type) {
      error = 'Name and type are required';
      return;
    }

    saving = true;
    error = '';

    try {
      await saveMutation.mutateAsync({
        name,
        type,
        description: description || undefined,
        parentId: parentId || undefined,
        color,
        icon: icon || undefined
      });
    } finally {
      saving = false;
    }
  }
</script>

<div class="taxonomy-edit">
  <header class="header">
    <div class="header-content">
      <h1>{id ? 'Edit Taxonomy' : 'New Taxonomy'}</h1>
      <div class="actions">
        <Button
          variant="secondary"
          on:click={() => navigate('/admin/taxonomies')}
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
    </div>

    {#if error}
      <div class="error">
        {error}
      </div>
    {/if}
  </header>

  <main class="main">
    {#if id && $taxonomyQuery.isLoading}
      <div class="loading">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="form">
        <div class="form-group">
          <TextField
            id="name"
            label="Name"
            bind:value={name}
            required
          />
        </div>

        <div class="form-group">
          <label for="type">Type</label>
          <select id="type" bind:value={type}>
            <option value="category">Category</option>
            <option value="tag">Tag</option>
            <option value="series">Series</option>
          </select>
        </div>

        <div class="form-group">
          <label for="parent">Parent Taxonomy</label>
          <select id="parent" bind:value={parentId}>
            <option value="">None</option>
            {#if $parentTaxonomiesQuery.data?.taxonomies}
              {#each $parentTaxonomiesQuery.data.taxonomies as tax}
                {#if tax.id !== id}
                  <option value={tax.id}>{tax.name}</option>
                {/if}
              {/each}
            {/if}
          </select>
        </div>

        <div class="form-group">
          <TextField
            id="description"
            label="Description"
            bind:value={description}
            multiline
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <ColorPicker
              label="Color"
              bind:value={color}
            />
          </div>

          <div class="form-group">
            <TextField
              id="icon"
              label="Icon"
              bind:value={icon}
              placeholder="e.g., 🎵 or icon-music"
            />
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  .taxonomy-edit {
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

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-top: var(--space-4);
  }

  .main {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: var(--space-6);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 800px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
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

  @media (max-width: 640px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
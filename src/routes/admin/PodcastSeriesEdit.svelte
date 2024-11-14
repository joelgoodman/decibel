<script lang="ts">
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { navigate } from 'svelte-routing';
  import BlockEditor from '../../lib/components/editor/BlockEditor.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import TextField from '../../lib/components/common/TextField.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import ImageUpload from '../../lib/components/common/ImageUpload.svelte';

  export let id: string | undefined = undefined;

  let title = '';
  let description = '';
  let coverImage = '';
  let blocks = [];
  let status = 'draft';
  let saving = false;
  let error = '';

  const seriesQuery = useQuery({
    queryKey: ['podcast-series', id],
    queryFn: () => api.getContentById(id!),
    enabled: !!id
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return id 
        ? api.updateContent(id, data)
        : api.createContent({ ...data, type: 'series' });
    },
    onSuccess: () => {
      navigate('/admin/podcast/series');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save series';
    }
  });

  $: if ($seriesQuery.data) {
    title = $seriesQuery.data.title;
    description = $seriesQuery.data.description || '';
    coverImage = $seriesQuery.data.coverImage || '';
    blocks = $seriesQuery.data.blocks;
    status = $seriesQuery.data.status;
  }

  async function handleSave() {
    if (!title) {
      error = 'Title is required';
      return;
    }

    saving = true;
    error = '';

    try {
      await saveMutation.mutateAsync({
        title,
        description,
        coverImage,
        blocks,
        status
      });
    } finally {
      saving = false;
    }
  }
</script>

<div class="series-edit">
  <header class="header">
    <div class="header-content">
      <h1>{id ? 'Edit Series' : 'New Series'}</h1>
      <div class="actions">
        <Button
          variant="secondary"
          on:click={() => navigate('/admin/podcast/series')}
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
    {#if id && $seriesQuery.isLoading}
      <div class="loading">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="form">
        <div class="form-row">
          <div class="form-group form-group--large">
            <TextField
              id="title"
              label="Title"
              bind:value={title}
              required
            />
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" bind:value={status}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <TextField
            id="description"
            label="Description"
            bind:value={description}
            multiline
          />
        </div>

        <div class="form-group">
          <ImageUpload
            label="Cover Image"
            bind:value={coverImage}
            aspectRatio="16:9"
            maxSize={2}
          />
        </div>

        <div class="editor">
          <h2>Show Notes Template</h2>
          <p class="hint">This template will be used as the default for new episodes in this series.</p>
          <BlockEditor
            bind:blocks
            on:change={() => error = ''}
          />
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  .series-edit {
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
  }

  .form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
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

  .editor {
    margin-top: var(--space-6);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--space-2);
  }

  .hint {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin: 0 0 var(--space-4);
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
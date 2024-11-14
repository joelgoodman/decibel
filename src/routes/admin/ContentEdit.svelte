<script lang="ts">
  import { onMount } from 'svelte';
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { navigate } from 'svelte-routing';
  import BlockEditor from '../../lib/components/editor/BlockEditor.svelte';
  import ContentTaxonomies from '../../lib/components/admin/taxonomy/ContentTaxonomies.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import TextField from '../../lib/components/common/TextField.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';

  export let id: string | undefined = undefined;

  let title = '';
  let blocks = [];
  let status = 'draft';
  let type = 'post';
  let saving = false;
  let error = '';

  const contentQuery = useQuery({
    queryKey: ['content', id],
    queryFn: () => api.getContentById(id!),
    enabled: !!id
  });

  const taxonomiesQuery = useQuery({
    queryKey: ['taxonomies'],
    queryFn: () => api.getTaxonomies()
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return id 
        ? api.updateContent(id, data)
        : api.createContent(data);
    },
    onSuccess: () => {
      navigate('/admin/content');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save content';
    }
  });

  $: if ($contentQuery.data) {
    title = $contentQuery.data.title;
    blocks = $contentQuery.data.blocks;
    status = $contentQuery.data.status;
    type = $contentQuery.data.type;
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
        blocks,
        status,
        type
      });
    } finally {
      saving = false;
    }
  }
</script>

<div class="content-edit">
  <header class="header">
    <div class="header-content">
      <h1>{id ? 'Edit Content' : 'New Content'}</h1>
      <div class="actions">
        <Button
          variant="secondary"
          on:click={() => navigate('/admin/content')}
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
    {#if id && $contentQuery.isLoading}
      <div class="loading">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="content-form">
        <div class="metadata">
          <TextField
            id="title"
            label="Title"
            bind:value={title}
            required
          />

          <div class="select-group">
            <label for="type">Type</label>
            <select id="type" bind:value={type}>
              <option value="post">Post</option>
              <option value="page">Page</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>

          <div class="select-group">
            <label for="status">Status</label>
            <select id="status" bind:value={status}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        <div class="taxonomies">
          {#if $taxonomiesQuery.data?.taxonomies}
            {#each $taxonomiesQuery.data.taxonomies as taxonomy}
              <ContentTaxonomies
                contentId={id}
                taxonomyType={taxonomy.type}
              />
            {/each}
          {/if}
        </div>

        <div class="editor">
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
  .content-edit {
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

  .metadata {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .select-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .select-group label {
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

  .taxonomies {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .editor {
    margin-top: var(--space-6);
  }

  @media (max-width: 768px) {
    .metadata {
      grid-template-columns: 1fr;
    }
  }
</style>
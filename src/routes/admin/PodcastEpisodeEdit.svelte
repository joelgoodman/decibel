<script lang="ts">
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { navigate } from 'svelte-routing';
  import BlockEditor from '../../lib/components/editor/BlockEditor.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import TextField from '../../lib/components/common/TextField.svelte';
  import ImageUpload from '../../lib/components/common/ImageUpload.svelte';
  import AudioUpload from '../../lib/components/admin/podcast/AudioUpload.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';

  export let id: string | undefined = undefined;
  export let seriesId: string;

  let title = '';
  let episodeNumber = '';
  let description = '';
  let transcript = '';
  let coverImage = '';
  let audioUrl = '';
  let audioDuration = 0;
  let blocks = [];
  let status = 'draft';
  let saving = false;
  let error = '';

  const episodeQuery = useQuery({
    queryKey: ['podcast-episode', id],
    queryFn: () => api.getContentById(id!),
    enabled: !!id
  });

  const seriesQuery = useQuery({
    queryKey: ['podcast-series', seriesId],
    queryFn: () => api.getContentById(seriesId)
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return id 
        ? api.updateContent(id, data)
        : api.createContent({ ...data, type: 'podcast', seriesId });
    },
    onSuccess: () => {
      navigate(`/admin/podcast/series/${seriesId}/episodes`);
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save episode';
    }
  });

  $: if ($episodeQuery.data) {
    title = $episodeQuery.data.title;
    episodeNumber = $episodeQuery.data.episodeNumber || '';
    description = $episodeQuery.data.description || '';
    transcript = $episodeQuery.data.transcript || '';
    coverImage = $episodeQuery.data.coverImage || '';
    audioUrl = $episodeQuery.data.audioUrl || '';
    audioDuration = $episodeQuery.data.audioDuration || 0;
    blocks = $episodeQuery.data.blocks;
    status = $episodeQuery.data.status;
  }

  $: if (!id && $seriesQuery.data?.blocks) {
    blocks = $seriesQuery.data.blocks; // Use series template for new episodes
  }

  async function handleSave() {
    if (!title) {
      error = 'Title is required';
      return;
    }

    if (!audioUrl) {
      error = 'Audio file is required';
      return;
    }

    saving = true;
    error = '';

    try {
      await saveMutation.mutateAsync({
        title,
        episodeNumber: episodeNumber || undefined,
        description,
        transcript,
        coverImage: coverImage || undefined,
        audioUrl,
        audioDuration,
        blocks,
        status
      });
    } finally {
      saving = false;
    }
  }

  function handleAudioUpload(event: CustomEvent) {
    audioUrl = event.detail.url;
    audioDuration = event.detail.duration;
  }
</script>

<div class="episode-edit">
  <header class="header">
    <div class="header-content">
      <div class="title">
        <h1>{id ? 'Edit Episode' : 'New Episode'}</h1>
        {#if $seriesQuery.data}
          <span class="series-name">
            {$seriesQuery.data.title}
          </span>
        {/if}
      </div>
      <div class="actions">
        <Button
          variant="secondary"
          on:click={() => navigate(`/admin/podcast/series/${seriesId}/episodes`)}
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
      <div class="error" role="alert">
        {error}
      </div>
    {/if}
  </header>

  <main class="main">
    {#if id && $episodeQuery.isLoading}
      <div class="loading">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="form">
        <div class="form-row">
          <div class="form-group form-group--large">
            <TextField
              id="title"
              label="Episode Title"
              bind:value={title}
              required
            />
          </div>

          <div class="form-group">
            <TextField
              id="episode-number"
              label="Episode Number"
              type="number"
              bind:value={episodeNumber}
              min="1"
            />
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" bind:value={status}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <TextField
            id="description"
            label="Episode Overview"
            bind:value={description}
            multiline
            rows={3}
          />
        </div>

        <div class="media-section">
          <div class="media-row">
            <div class="form-group">
              <AudioUpload
                value={audioUrl}
                duration={audioDuration}
                on:change={handleAudioUpload}
              />
            </div>

            <div class="form-group">
              <ImageUpload
                label="Episode Cover"
                bind:value={coverImage}
                aspectRatio="1:1"
                maxSize={2}
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <TextField
            id="transcript"
            label="Full Transcript"
            bind:value={transcript}
            multiline
            rows={10}
            placeholder="Add a full transcript of the episode for accessibility and SEO..."
          />
        </div>

        <div class="editor">
          <h2>Show Notes</h2>
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
  .episode-edit {
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

  .title {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  .series-name {
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
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
    grid-template-columns: 2fr 1fr 1fr;
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

  .media-section {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .media-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-4);
  }

  .editor {
    margin-top: var(--space-6);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--space-4);
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .media-row {
      grid-template-columns: 1fr;
    }
  }
</style>
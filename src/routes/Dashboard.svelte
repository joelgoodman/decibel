<script lang="ts">
  import { useQuery } from '../lib/hooks/useQuery';
  import { api } from '../lib/services/api';
  import { auth } from '../lib/stores/auth';
  import LoadingSpinner from '../lib/components/common/LoadingSpinner.svelte';

  const publications = useQuery({
    queryKey: ['publications'],
    queryFn: () => api.getPublications({ limit: 3 }),
    enabled: $auth.isAuthenticated
  });

  const content = useQuery({
    queryKey: ['content'],
    queryFn: () => api.getContent({ limit: 5 }),
    enabled: $auth.isAuthenticated
  });
</script>

<div class="container">
  <h1>Dashboard</h1>

  <div class="grid">
    <!-- Publications Section -->
    <div class="card">
      <div class="card-header">
        <h2>Recent Publications</h2>
        <a href="/publications">View All</a>
      </div>

      {#if $publications.isLoading}
        <div class="loading-container">
          <LoadingSpinner size="small" />
        </div>
      {:else if $publications.error}
        <div class="error">
          {$publications.error instanceof Error ? $publications.error.message : 'Error loading publications'}
        </div>
      {:else if $publications.data?.publications.length === 0}
        <p class="empty">No publications yet.</p>
      {:else}
        <div class="list">
          {#each $publications.data.publications as publication}
            <div class="list-item">
              <h3>{publication.title}</h3>
              {#if publication.description}
                <p class="description">{publication.description}</p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Recent Content Section -->
    <div class="card">
      <div class="card-header">
        <h2>Recent Content</h2>
        <a href="/content">View All</a>
      </div>

      {#if $content.isLoading}
        <div class="loading-container">
          <LoadingSpinner size="small" />
        </div>
      {:else if $content.error}
        <div class="error">
          {$content.error instanceof Error ? $content.error.message : 'Error loading content'}
        </div>
      {:else if $content.data?.content.length === 0}
        <p class="empty">No content yet.</p>
      {:else}
        <div class="list">
          {#each $content.data.content as item}
            <div class="list-item">
              <div class="content-header">
                <h3>{item.title}</h3>
                <span class="status status-{item.status.toLowerCase()}">
                  {item.status}
                </span>
              </div>
              <p class="date">
                {new Date(item.updated_at).toLocaleDateString()}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  .grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .card {
    background: var(--card-bg);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .card-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .card-header a {
    color: var(--primary-color);
    text-decoration: none;
  }

  .card-header a:hover {
    text-decoration: underline;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
  }

  .error {
    color: var(--error-color);
    padding: 1rem 0;
  }

  .empty {
    color: var(--text-muted);
    padding: 1rem 0;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list-item {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .list-item:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .list-item h3 {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .description {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
  }

  .status-draft {
    background: var(--status-draft-bg);
    color: var(--status-draft-text);
  }

  .status-published {
    background: var(--status-published-bg);
    color: var(--status-published-text);
  }

  .status-scheduled {
    background: var(--status-scheduled-bg);
    color: var(--status-scheduled-text);
  }

  .status-archived {
    background: var(--status-archived-bg);
    color: var(--status-archived-text);
  }

  .date {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }

  :global(.dark) {
    --card-bg: #1f2937;
    --border-color: #374151;
    --text-muted: #9ca3af;
    --primary-color: #818cf8;
    --error-color: #ef4444;
    --status-draft-bg: #374151;
    --status-draft-text: #d1d5db;
    --status-published-bg: #065f46;
    --status-published-text: #6ee7b7;
    --status-scheduled-bg: #1e40af;
    --status-scheduled-text: #93c5fd;
    --status-archived-bg: #991b1b;
    --status-archived-text: #fca5a5;
  }

  :global(:not(.dark)) {
    --card-bg: #ffffff;
    --border-color: #e5e7eb;
    --text-muted: #6b7280;
    --primary-color: #4f46e5;
    --error-color: #dc2626;
    --status-draft-bg: #f3f4f6;
    --status-draft-text: #4b5563;
    --status-published-bg: #dcfce7;
    --status-published-text: #166534;
    --status-scheduled-bg: #dbeafe;
    --status-scheduled-text: #1e40af;
    --status-archived-bg: #fee2e2;
    --status-archived-text: #991b1b;
  }
</style>
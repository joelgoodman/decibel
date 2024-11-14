<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { navigate } from 'svelte-routing';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  export let id: string;

  const segmentQuery = useQuery({
    queryKey: ['segment', id],
    queryFn: () => api.getSegmentById(id)
  });

  const subscribersQuery = useQuery({
    queryKey: ['segment-subscribers', id],
    queryFn: () => api.getSegmentSubscribers(id)
  });
</script>

<div class="preview-page">
  <header class="header">
    <div class="header-content">
      <div class="title">
        <h1>Segment Preview</h1>
        {#if $segmentQuery.data}
          <span class="segment-name">{$segmentQuery.data.name}</span>
        {/if}
      </div>
      <Button
        variant="secondary"
        on:click={() => navigate('/admin/email/targeting')}
      >
        Back to Segments
      </Button>
    </div>
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $subscribersQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $subscribersQuery.data}
        <div class="preview-header">
          <h2>Matching Subscribers</h2>
          <span class="count">
            {$subscribersQuery.data.length} subscribers
          </span>
        </div>

        {#if $subscribersQuery.data.length === 0}
          <div class="empty">
            <p>No subscribers match this segment's criteria</p>
          </div>
        {:else}
          <div class="subscriber-list">
            <table>
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Roles</th>
                  <th>Subscription</th>
                  <th>Last Active</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {#each $subscribersQuery.data as subscriber}
                  <tr>
                    <td>
                      <div class="subscriber-info">
                        {#if subscriber.avatar}
                          <img src={subscriber.avatar} alt="" class="avatar" />
                        {:else}
                          <div class="avatar-placeholder">
                            {subscriber.name?.[0] || subscriber.email[0]}
                          </div>
                        {/if}
                        <div class="subscriber-details">
                          <span class="name">{subscriber.name || 'Unnamed Subscriber'}</span>
                          <span class="email">{subscriber.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="roles">
                        {#each subscriber.roles as role}
                          <span class="role">{role}</span>
                        {/each}
                      </div>
                    </td>
                    <td>
                      <span class="subscription-type">
                        {subscriber.subscriptionType || 'Free'}
                      </span>
                    </td>
                    <td>
                      {#if subscriber.lastActiveAt}
                        <time datetime={subscriber.lastActiveAt}>
                          {new Date(subscriber.lastActiveAt).toLocaleDateString()}
                        </time>
                      {:else}
                        Never
                      {/if}
                    </td>
                    <td>
                      <time datetime={subscriber.createdAt}>
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </time>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/if}
    </QueryErrorBoundary>
  </main>
</div>

<style>
  .preview-page {
    padding: var(--space-6);
  }

  .header {
    margin-bottom: var(--space-6);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin: 0;
  }

  .segment-name {
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
  }

  .main {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: var(--space-6);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
  }

  .count {
    color: var(--text-secondary);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }

  .empty {
    text-align: center;
    padding: var(--space-8);
    color: var(--text-secondary);
  }

  .subscriber-list {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: var(--space-4);
    text-align: left;
    border-bottom: 1px solid var(--border-primary);
  }

  th {
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
  }

  .subscriber-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .avatar,
  .avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .avatar-placeholder {
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    text-transform: uppercase;
  }

  .subscriber-details {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-weight: 500;
  }

  .email {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .roles {
    display: flex;
    gap: var(--space-1);
  }

  .role {
    font-size: var(--font-size-xs);
    padding: var(--space-1) var(--space-2);
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
  }

  .subscription-type {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }
</style>
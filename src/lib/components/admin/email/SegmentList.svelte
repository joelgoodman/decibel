<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';
  import Badge from '../../common/Badge.svelte';
  import Button from '../../common/Button.svelte';

  export let segments = [];

  const dispatch = createEventDispatcher();

  function getSegmentSize(segment: any) {
    return segment.subscribers?.length || 0;
  }

  function formatRules(rules: any[]) {
    return rules.map(rule => {
      switch (rule.type) {
        case 'role':
          return `Role is ${rule.value}`;
        case 'subscription':
          return `Subscription is ${rule.value}`;
        case 'activity':
          return `Last active ${rule.operator} ${rule.value} days ago`;
        default:
          return rule.description || 'Custom rule';
      }
    }).join(' AND ');
  }
</script>

<div class="segment-list">
  {#each segments as segment}
    <div class="segment-card">
      <div class="segment-header">
        <div class="segment-info">
          <h3>{segment.name}</h3>
          <p class="description">{segment.description}</p>
        </div>
        <Badge variant="info" size="sm">
          {getSegmentSize(segment)} subscribers
        </Badge>
      </div>

      <div class="segment-rules">
        <h4>Targeting Rules</h4>
        <p class="rules">{formatRules(segment.rules)}</p>
      </div>

      <div class="segment-meta">
        <span class="date">
          Updated {format(new Date(segment.updatedAt), 'MMM d, yyyy')}
        </span>
        <div class="actions">
          <Button
            variant="secondary"
            size="sm"
            on:click={() => dispatch('edit', segment.id)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            href={`/admin/email/segments/${segment.id}/preview`}
          >
            View Subscribers
          </Button>
        </div>
      </div>
    </div>
  {/each}

  {#if segments.length === 0}
    <div class="empty">
      <p>No segments created yet</p>
      <p class="hint">Create segments to target specific groups of subscribers</p>
    </div>
  {/if}
</div>

<style>
  .segment-list {
    padding: var(--space-4);
  }

  .segment-card {
    padding: var(--space-4);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-4);
  }

  .segment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-4);
  }

  .segment-info {
    flex: 1;
    margin-right: var(--space-4);
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: 0 0 var(--space-1);
  }

  .description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .segment-rules {
    background: var(--bg-secondary);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }

  h4 {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-secondary);
    margin: 0 0 var(--space-2);
  }

  .rules {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
  }

  .segment-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .date {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .empty {
    text-align: center;
    padding: var(--space-8);
    color: var(--text-secondary);
  }

  .hint {
    font-size: var(--font-size-sm);
    margin-top: var(--space-2);
  }
</style>
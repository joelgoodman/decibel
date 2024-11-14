<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import SegmentList from '../../lib/components/admin/email/SegmentList.svelte';
  import SegmentForm from '../../lib/components/admin/email/SegmentForm.svelte';
  import SubscriberActions from '../../lib/components/admin/email/SubscriberActions.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  let showForm = false;
  let selectedSegmentId: string | null = null;

  const segmentsQuery = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.getSegments()
  });

  function handleFormClose() {
    showForm = false;
    selectedSegmentId = null;
  }

  function handleFormSuccess() {
    showForm = false;
    selectedSegmentId = null;
    segmentsQuery.refetch();
  }

  function handleSegmentEdit(event: CustomEvent<string>) {
    selectedSegmentId = event.detail;
    showForm = true;
  }

  function handleImportSuccess() {
    segmentsQuery.refetch();
  }
</script>

<div class="targeting-page">
  <header class="header">
    <div class="header-content">
      <div>
        <h1>Email Targeting</h1>
        <p class="description">Create and manage subscriber segments for targeted email campaigns</p>
      </div>
      <Button 
        variant="primary"
        on:click={() => {
          selectedSegmentId = null;
          showForm = true;
        }}
      >
        Create Segment
      </Button>
    </div>

    <SubscriberActions on:success={handleImportSuccess} />
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $segmentsQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $segmentsQuery.data}
        <SegmentList 
          segments={$segmentsQuery.data}
          on:edit={e => handleSegmentEdit(e)}
        />
      {/if}
    </QueryErrorBoundary>
  </main>

  {#if showForm}
    <SegmentForm
      segmentId={selectedSegmentId}
      on:close={handleFormClose}
      on:success={handleFormSuccess}
    />
  {/if}
</div>

<style>
  .targeting-page {
    padding: var(--space-6);
  }

  .header {
    margin-bottom: var(--space-6);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin: 0 0 var(--space-2);
  }

  .description {
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    margin: 0;
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
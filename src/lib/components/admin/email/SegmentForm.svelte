<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../../lib/services/api';
  import TextField from '../../common/TextField.svelte';
  import Button from '../../common/Button.svelte';
  import LoadingSpinner from '../../common/LoadingSpinner.svelte';

  export let segmentId: string | null = null;

  const dispatch = createEventDispatcher();
  let error = '';
  let saving = false;

  let name = '';
  let description = '';
  let rules = [{
    type: 'role',
    value: '',
    operator: 'is'
  }];

  const segmentQuery = useQuery({
    queryKey: ['segment', segmentId],
    queryFn: () => api.getSegmentById(segmentId!),
    enabled: !!segmentId
  });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.getRoles()
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return segmentId
        ? api.updateSegment(segmentId, data)
        : api.createSegment(data);
    },
    onSuccess: () => {
      dispatch('success');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save segment';
    }
  });

  $: if ($segmentQuery.data) {
    name = $segmentQuery.data.name;
    description = $segmentQuery.data.description || '';
    rules = $segmentQuery.data.rules;
  }

  function addRule() {
    rules = [...rules, {
      type: 'role',
      value: '',
      operator: 'is'
    }];
  }

  function removeRule(index: number) {
    rules = rules.filter((_, i) => i !== index);
  }

  async function handleSave() {
    if (!name) {
      error = 'Name is required';
      return;
    }

    if (!rules.length) {
      error = 'At least one rule is required';
      return;
    }

    if (rules.some(rule => !rule.value)) {
      error = 'All rules must have a value';
      return;
    }

    saving = true;
    error = '';

    try {
      await saveMutation.mutateAsync({
        name,
        description,
        rules
      });
    } finally {
      saving = false;
    }
  }
</script>

<div class="modal-overlay">
  <div class="modal">
    <header class="modal-header">
      <h2>{segmentId ? 'Edit Segment' : 'Create Segment'}</h2>
      <button class="close-button" on:click={() => dispatch('close')}>×</button>
    </header>

    {#if error}
      <div class="error" role="alert">
        {error}
      </div>
    {/if}

    <div class="modal-content">
      {#if segmentId && $segmentQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else}
        <div class="form">
          <TextField
            id="name"
            label="Segment Name"
            bind:value={name}
            required
          />

          <TextField
            id="description"
            label="Description"
            bind:value={description}
            multiline
          />

          <div class="rules-section">
            <div class="rules-header">
              <h3>Targeting Rules</h3>
              <Button
                variant="secondary"
                size="sm"
                on:click={addRule}
              >
                Add Rule
              </Button>
            </div>

            {#each rules as rule, index}
              <div class="rule">
                <select bind:value={rule.type}>
                  <option value="role">User Role</option>
                  <option value="subscription">Subscription Type</option>
                  <option value="activity">Last Activity</option>
                </select>

                {#if rule.type === 'role'}
                  <select bind:value={rule.value}>
                    <option value="">Select Role</option>
                    {#if $rolesQuery.data?.roles}
                      {#each $rolesQuery.data.roles as role}
                        <option value={role.name}>{role.name}</option>
                      {/each}
                    {/if}
                  </select>
                {:else if rule.type === 'subscription'}
                  <select bind:value={rule.value}>
                    <option value="">Select Type</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="premium">Premium</option>
                  </select>
                {:else if rule.type === 'activity'}
                  <select bind:value={rule.operator}>
                    <option value="less">Less than</option>
                    <option value="more">More than</option>
                  </select>
                  <input
                    type="number"
                    bind:value={rule.value}
                    min="1"
                    placeholder="days"
                  />
                {/if}

                <button
                  class="remove-button"
                  on:click={() => removeRule(index)}
                  disabled={rules.length === 1}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <footer class="modal-footer">
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
        {saving ? 'Saving...' : 'Save Segment'}
      </Button>
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

  .rules-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .rules-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h3 {
    font-size: var(--font-size-base);
    font-weight: 500;
    margin: 0;
  }

  .rule {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    background: var(--bg-secondary);
    padding: var(--space-2);
    border-radius: var(--radius-md);
  }

  select,
  input {
    padding: var(--space-2);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
  }

  select {
    min-width: 120px;
  }

  input[type="number"] {
    width: 80px;
  }

  .remove-button {
    padding: var(--space-2);
    background: var(--error-light);
    color: var(--error);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-lg);
    line-height: 1;
  }

  .remove-button:hover:not(:disabled) {
    background: var(--error);
    color: white;
  }

  .remove-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--border-primary);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }
</style>
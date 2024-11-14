<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { debounce } from '../../../utils/debounce';
  import TextField from '../../common/TextField.svelte';

  const dispatch = createEventDispatcher();

  let status = 'all';
  let search = '';

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' }
  ];

  const debouncedSearch = debounce((value: string) => {
    dispatch('change', { search: value });
  }, 300);

  function handleStatusChange() {
    dispatch('change', { status });
  }

  function handleSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    search = value;
    debouncedSearch(value);
  }
</script>

<div class="filters">
  <div class="filter-group">
    <select bind:value={status} on:change={handleStatusChange}>
      {#each statuses as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  <TextField
    id="search"
    value={search}
    on:input={handleSearch}
    placeholder="Search episodes..."
  />
</div>

<style>
  .filters {
    display: flex;
    gap: var(--space-4);
  }

  .filter-group {
    min-width: 200px;
  }

  select {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
  }

  select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }

  @media (max-width: 640px) {
    .filters {
      flex-direction: column;
    }
  }
</style>
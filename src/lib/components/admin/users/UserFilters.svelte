<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { debounce } from '../../../utils/debounce';
  import TextField from '../../common/TextField.svelte';

  export let roles = [];

  const dispatch = createEventDispatcher();

  let role = 'all';
  let search = '';

  const debouncedSearch = debounce((value: string) => {
    dispatch('change', { search: value });
  }, 300);

  function handleRoleChange() {
    dispatch('change', { role });
  }

  function handleSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    search = value;
    debouncedSearch(value);
  }
</script>

<div class="filters">
  <div class="filter-group">
    <select bind:value={role} on:change={handleRoleChange}>
      <option value="all">All Roles</option>
      {#each roles as r}
        <option value={r.name}>{r.name}</option>
      {/each}
    </select>
  </div>

  <TextField
    id="search"
    value={search}
    on:input={handleSearch}
    placeholder="Search users..."
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
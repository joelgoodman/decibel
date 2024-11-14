<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { debounce } from '../../utils/debounce';
  import TextField from '../common/TextField.svelte';
  
  export let value = '';
  export let placeholder = 'Search content...';
  
  const dispatch = createEventDispatcher();
  
  const debouncedSearch = debounce((query: string) => {
    dispatch('search', { query });
  }, 300);

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    debouncedSearch(value);
  }
</script>

<div class="search">
  <TextField
    id="content-search"
    type="text"
    {value}
    {placeholder}
    on:input={handleInput}
  >
    <slot name="icon">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </slot>
  </TextField>
</div>

<style>
  .search {
    position: relative;
    width: 100%;
  }

  .search-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--text-secondary);
  }
</style>
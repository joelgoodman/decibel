<script lang="ts">
  import { useQuery } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import UserList from '../../lib/components/admin/users/UserList.svelte';
  import UserFilters from '../../lib/components/admin/users/UserFilters.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import QueryErrorBoundary from '../../lib/components/error/QueryErrorBoundary.svelte';

  let filters = {
    search: '',
    role: 'all',
    page: 1,
    limit: 10
  };

  $: queryParams = {
    ...filters,
    role: filters.role === 'all' ? undefined : filters.role
  };

  const usersQuery = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => api.getUsers(queryParams)
  });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.getRoles()
  });

  function handleFilterChange(event: CustomEvent) {
    filters = { ...filters, ...event.detail, page: 1 };
  }

  function handlePageChange(page: number) {
    filters = { ...filters, page };
  }
</script>

<div class="users-page">
  <header class="header">
    <div class="header-content">
      <h1>Users</h1>
      <Button href="/admin/users/new" variant="primary">Invite User</Button>
    </div>
    <UserFilters 
      roles={$rolesQuery.data?.roles || []}
      on:change={handleFilterChange} 
    />
  </header>

  <main class="main">
    <QueryErrorBoundary>
      {#if $usersQuery.isLoading}
        <div class="loading">
          <LoadingSpinner />
        </div>
      {:else if $usersQuery.data}
        <UserList 
          items={$usersQuery.data.users}
          total={$usersQuery.data.total}
          roles={$rolesQuery.data?.roles || []}
          {filters}
          on:pageChange={(e) => handlePageChange(e.detail)}
        />
      {/if}
    </QueryErrorBoundary>
  </main>
</div>

<style>
  .users-page {
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
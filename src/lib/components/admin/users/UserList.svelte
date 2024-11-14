<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';
  import Badge from '../../common/Badge.svelte';
  import Button from '../../common/Button.svelte';

  export let items = [];
  export let total = 0;
  export let roles = [];
  export let filters = {
    page: 1,
    limit: 10
  };

  const dispatch = createEventDispatcher();

  function getRoleBadgeVariant(role: string) {
    switch (role.toLowerCase()) {
      case 'owner': return 'error';
      case 'admin': return 'warning';
      case 'editor': return 'info';
      default: return 'default';
    }
  }

  $: totalPages = Math.ceil(total / filters.limit);
</script>

<div class="user-list">
  <table>
    <thead>
      <tr>
        <th>User</th>
        <th>Roles</th>
        <th>Last Active</th>
        <th>Joined</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each items as user}
        <tr>
          <td>
            <div class="user-info">
              {#if user.avatar}
                <img src={user.avatar} alt="" class="avatar" />
              {:else}
                <div class="avatar-placeholder">
                  {user.name?.[0] || user.email[0]}
                </div>
              {/if}
              <div class="user-details">
                <span class="name">{user.name || 'Unnamed User'}</span>
                <span class="email">{user.email}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="roles">
              {#each user.roles as role}
                <Badge 
                  variant={getRoleBadgeVariant(role)} 
                  size="sm"
                >
                  {role}
                </Badge>
              {/each}
            </div>
          </td>
          <td>
            {#if user.lastActiveAt}
              <time datetime={user.lastActiveAt}>
                {format(new Date(user.lastActiveAt), 'MMM d, yyyy')}
              </time>
            {:else}
              Never
            {/if}
          </td>
          <td>
            <time datetime={user.createdAt}>
              {format(new Date(user.createdAt), 'MMM d, yyyy')}
            </time>
          </td>
          <td>
            <div class="actions">
              <Button 
                variant="secondary" 
                size="sm"
                href={`/admin/users/${user.id}`}
              >
                Edit
              </Button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if totalPages > 1}
    <div class="pagination">
      <Button
        variant="secondary"
        size="sm"
        disabled={filters.page === 1}
        on:click={() => dispatch('pageChange', filters.page - 1)}
      >
        Previous
      </Button>

      <span class="page-info">
        Page {filters.page} of {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={filters.page === totalPages}
        on:click={() => dispatch('pageChange', filters.page + 1)}
      >
        Next
      </Button>
    </div>
  {/if}
</div>

<style>
  .user-list {
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

  .user-info {
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

  .user-details {
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
    flex-wrap: wrap;
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-4);
    border-top: 1px solid var(--border-primary);
  }

  .page-info {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
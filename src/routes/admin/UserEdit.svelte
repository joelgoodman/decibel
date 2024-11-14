<script lang="ts">
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { navigate } from 'svelte-routing';
  import Button from '../../lib/components/common/Button.svelte';
  import TextField from '../../lib/components/common/TextField.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';

  export let id: string | undefined = undefined;

  let name = '';
  let email = '';
  let roles: string[] = [];
  let saving = false;
  let error = '';

  const userQuery = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.getUserById(id!),
    enabled: !!id
  });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.getRoles()
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return id 
        ? api.updateUser(id, data)
        : api.inviteUser(data);
    },
    onSuccess: () => {
      navigate('/admin/users');
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save user';
    }
  });

  $: if ($userQuery.data) {
    name = $userQuery.data.name || '';
    email = $userQuery.data.email;
    roles = $userQuery.data.roles;
  }

  async function handleSave() {
    if (!email || roles.length === 0) {
      error = 'Email and at least one role are required';
      return;
    }

    saving = true;
    error = '';

    try {
      await saveMutation.mutateAsync({
        name,
        email,
        roles
      });
    } finally {
      saving = false;
    }
  }
</script>

<div class="user-edit">
  <header class="header">
    <div class="header-content">
      <h1>{id ? 'Edit User' : 'Invite User'}</h1>
      <div class="actions">
        <Button
          variant="secondary"
          on:click={() => navigate('/admin/users')}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          on:click={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : id ? 'Save Changes' : 'Send Invitation'}
        </Button>
      </div>
    </div>

    {#if error}
      <div class="error" role="alert">
        {error}
      </div>
    {/if}
  </header>

  <main class="main">
    {#if id && $userQuery.isLoading}
      <div class="loading">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="form">
        <div class="form-section">
          <h3>User Information</h3>
          
          <div class="form-group">
            <TextField
              id="name"
              label="Name"
              bind:value={name}
            />
          </div>

          <div class="form-group">
            <TextField
              id="email"
              label="Email"
              type="email"
              bind:value={email}
              required
              disabled={!!id}
            />
          </div>
        </div>

        <div class="form-section">
          <h3>Roles & Permissions</h3>
          
          <div class="roles-grid">
            {#if $rolesQuery.data?.roles}
              {#each $rolesQuery.data.roles as role}
                <label class="role-option">
                  <input
                    type="checkbox"
                    value={role.name}
                    bind:group={roles}
                    disabled={role.name === 'owner' && !roles.includes('owner')}
                  />
                  <div class="role-info">
                    <span class="role-name">{role.name}</span>
                    <span class="role-description">
                      {role.permissions.join(', ')}
                    </span>
                  </div>
                </label>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  .user-edit {
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

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-top: var(--space-4);
  }

  .main {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: var(--space-6);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    max-width: 800px;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: 500;
    margin: 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .roles-grid {
    display: grid;
    gap: var(--space-3);
  }

  .role-option {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .role-option input {
    margin-top: var(--space-1);
  }

  .role-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .role-name {
    font-weight: 500;
  }

  .role-description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }
</style>
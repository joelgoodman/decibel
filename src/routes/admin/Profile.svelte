<script lang="ts">
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import { auth } from '../../lib/stores/auth';
  import TextField from '../../lib/components/common/TextField.svelte';
  import Button from '../../lib/components/common/Button.svelte';
  import ImageUpload from '../../lib/components/common/ImageUpload.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';

  let saving = false;
  let error = '';

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getCurrentUser(),
    enabled: $auth.isAuthenticated
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateProfile(data),
    onSuccess: () => {
      profileQuery.refetch();
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to update profile';
    }
  });

  async function handleSave(event: Event) {
    event.preventDefault();
    if (!$profileQuery.data) return;

    saving = true;
    error = '';

    try {
      await updateMutation.mutateAsync({
        name: $profileQuery.data.name,
        avatar: $profileQuery.data.avatar,
        preferences: $profileQuery.data.preferences
      });
    } finally {
      saving = false;
    }
  }
</script>

<div class="profile-page">
  <header class="header">
    <h1>Profile Settings</h1>
  </header>

  <main class="main">
    {#if $profileQuery.isLoading}
      <div class="loading">
        <LoadingSpinner />
      </div>
    {:else if $profileQuery.data}
      {#if error}
        <div class="error" role="alert">
          {error}
        </div>
      {/if}

      <form class="form" on:submit={handleSave}>
        <div class="form-section">
          <h2>Basic Information</h2>
          
          <div class="avatar-section">
            <ImageUpload
              label="Profile Picture"
              bind:value={$profileQuery.data.avatar}
              aspectRatio="1:1"
              maxSize={1}
            />
          </div>

          <div class="form-group">
            <TextField
              id="name"
              label="Full Name"
              bind:value={$profileQuery.data.name}
            />
          </div>

          <div class="form-group">
            <TextField
              id="email"
              label="Email Address"
              value={$profileQuery.data.email}
              disabled
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Preferences</h2>
          
          <div class="preferences">
            <label class="checkbox">
              <input
                type="checkbox"
                bind:checked={$profileQuery.data.preferences.emailNotifications}
              />
              Receive email notifications
            </label>

            <label class="checkbox">
              <input
                type="checkbox"
                bind:checked={$profileQuery.data.preferences.twoFactorEnabled}
              />
              Enable two-factor authentication
            </label>
          </div>
        </div>

        <div class="form-section">
          <h2>Account Information</h2>
          
          <div class="account-info">
            <div class="info-row">
              <span class="label">Account Type</span>
              <span class="value">{$profileQuery.data.roles.join(', ')}</span>
            </div>

            <div class="info-row">
              <span class="label">Member Since</span>
              <span class="value">
                {new Date($profileQuery.data.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div class="info-row">
              <span class="label">Last Login</span>
              <span class="value">
                {$profileQuery.data.lastLoginAt ? 
                  new Date($profileQuery.data.lastLoginAt).toLocaleString() : 
                  'Never'}
              </span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    {/if}
  </main>
</div>

<style>
  .profile-page {
    padding: var(--space-6);
  }

  .header {
    margin-bottom: var(--space-6);
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  .main {
    max-width: 800px;
    margin: 0 auto;
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .form-section {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--space-4);
  }

  .avatar-section {
    max-width: 200px;
    margin-bottom: var(--space-6);
  }

  .form-group {
    margin-bottom: var(--space-4);
  }

  .preferences {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: var(--space-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  .label {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  .value {
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
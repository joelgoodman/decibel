<script lang="ts">
  import { useQuery, useMutation } from '@tanstack/svelte-query';
  import { api } from '../../lib/services/api';
  import SettingsNav from '../../lib/components/admin/settings/SettingsNav.svelte';
  import BrandSettings from '../../lib/components/admin/settings/BrandSettings.svelte';
  import SeoSettings from '../../lib/components/admin/settings/SeoSettings.svelte';
  import ThemeSettings from '../../lib/components/admin/settings/ThemeSettings.svelte';
  import LoadingSpinner from '../../lib/components/common/LoadingSpinner.svelte';
  import Button from '../../lib/components/common/Button.svelte';

  let activeSection = 'brand';
  let saving = false;
  let error = '';

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings()
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateSettings(data),
    onSuccess: () => {
      settingsQuery.refetch();
    },
    onError: (err) => {
      error = err instanceof Error ? err.message : 'Failed to save settings';
    }
  });

  async function handleSave(data: any) {
    saving = true;
    error = '';

    try {
      await updateMutation.mutateAsync(data);
    } finally {
      saving = false;
    }
  }
</script>

<div class="settings-page">
  <header class="header">
    <h1>System Settings</h1>
  </header>

  <main class="main">
    <div class="settings-layout">
      <aside class="sidebar">
        <SettingsNav bind:active={activeSection} />
      </aside>

      <div class="content">
        {#if $settingsQuery.isLoading}
          <div class="loading">
            <LoadingSpinner />
          </div>
        {:else if $settingsQuery.data}
          {#if error}
            <div class="error" role="alert">
              {error}
            </div>
          {/if}

          <div class="settings-section">
            {#if activeSection === 'brand'}
              <BrandSettings
                settings={$settingsQuery.data.brand}
                {saving}
                on:save={e => handleSave({ brand: e.detail })}
              />
            {:else if activeSection === 'seo'}
              <SeoSettings
                settings={$settingsQuery.data.seo}
                {saving}
                on:save={e => handleSave({ seo: e.detail })}
              />
            {:else if activeSection === 'theme'}
              <ThemeSettings
                settings={$settingsQuery.data.theme}
                {saving}
                on:save={e => handleSave({ theme: e.detail })}
              />
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

<style>
  .settings-page {
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
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }

  .settings-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 600px;
  }

  .sidebar {
    border-right: 1px solid var(--border-primary);
  }

  .content {
    padding: var(--space-6);
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

  @media (max-width: 768px) {
    .settings-layout {
      grid-template-columns: 1fr;
    }

    .sidebar {
      border-right: none;
      border-bottom: 1px solid var(--border-primary);
    }
  }
</style>
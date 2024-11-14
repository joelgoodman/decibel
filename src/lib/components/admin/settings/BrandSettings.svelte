<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TextField from '../../common/TextField.svelte';
  import ImageUpload from '../../common/ImageUpload.svelte';
  import ColorPicker from '../../common/ColorPicker.svelte';
  import Button from '../../common/Button.svelte';

  export let settings = {
    name: '',
    tagline: '',
    logo: '',
    favicon: '',
    colors: {
      primary: '#4f46e5',
      secondary: '#f3f4f6',
      accent: '#818cf8'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  };
  export let saving = false;

  const dispatch = createEventDispatcher();
  let error = '';

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Poppins', label: 'Poppins' }
  ];

  async function handleSave() {
    if (!settings.name) {
      error = 'Site name is required';
      return;
    }

    dispatch('save', settings);
  }
</script>

<div class="brand-settings">
  <header class="section-header">
    <div>
      <h2>Brand & Identity</h2>
      <p class="description">Configure your site's branding and visual identity</p>
    </div>
    <Button
      variant="primary"
      on:click={handleSave}
      disabled={saving}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  </header>

  {#if error}
    <div class="error" role="alert">
      {error}
    </div>
  {/if}

  <div class="settings-grid">
    <div class="form-section">
      <h3>Basic Information</h3>
      
      <div class="form-group">
        <TextField
          id="site-name"
          label="Site Name"
          bind:value={settings.name}
          required
        />
      </div>

      <div class="form-group">
        <TextField
          id="tagline"
          label="Tagline"
          bind:value={settings.tagline}
          placeholder="Briefly describe your site..."
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Logo & Favicon</h3>
      
      <div class="media-group">
        <ImageUpload
          label="Site Logo"
          bind:value={settings.logo}
          aspectRatio="3:1"
          maxSize={1}
        />

        <ImageUpload
          label="Favicon"
          bind:value={settings.favicon}
          aspectRatio="1:1"
          maxSize={0.5}
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Brand Colors</h3>
      
      <div class="color-group">
        <ColorPicker
          label="Primary Color"
          bind:value={settings.colors.primary}
        />

        <ColorPicker
          label="Secondary Color"
          bind:value={settings.colors.secondary}
        />

        <ColorPicker
          label="Accent Color"
          bind:value={settings.colors.accent}
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Typography</h3>
      
      <div class="form-group">
        <label for="heading-font">Heading Font</label>
        <select id="heading-font" bind:value={settings.fonts.heading}>
          {#each fontOptions as font}
            <option value={font.value}>{font.label}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="body-font">Body Font</label>
        <select id="body-font" bind:value={settings.fonts.body}>
          {#each fontOptions as font}
            <option value={font.value}>{font.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>

<style>
  .brand-settings {
    max-width: 800px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--space-2);
  }

  .description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
  }

  .settings-grid {
    display: grid;
    gap: var(--space-8);
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

  .media-group {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-4);
  }

  .color-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  @media (max-width: 640px) {
    .media-group,
    .color-group {
      grid-template-columns: 1fr;
    }
  }
</style>